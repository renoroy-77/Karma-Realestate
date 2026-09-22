import { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../lib/api';

export const LOCALITIES = [
  { n: 'Kannur City', d: 'Fort Road & town centre' },
  { n: 'Thottada', d: 'Beachside, 8 km south' },
  { n: 'Payyambalam', d: 'Coastal residential area' },
  { n: 'Talap', d: 'Central commercial & residential' },
  { n: 'South Bazar', d: 'Downtown shopping & business' },
  { n: 'Pallikkunnu', d: 'Prime suburban neighborhood' },
  { n: 'Chalad', d: 'Residential area near beach' },
  { n: 'Mele Chovva', d: 'Major junction & residential hub' }
];

export const LOCALITY_COORDS = {
  'Kannur City': { lat: 11.8745, lng: 75.3704 },
  'Kannur': { lat: 11.8745, lng: 75.3704 },
  'Thottada': { lat: 11.8239, lng: 75.4190 },
  'Payyambalam': { lat: 11.8680, lng: 75.3520 },
  'Payyambalam Beach': { lat: 11.8680, lng: 75.3520 },
  'Talap': { lat: 11.8821, lng: 75.3620 },
  'South Bazar': { lat: 11.8700, lng: 75.3710 },
  'Pallikkunnu': { lat: 11.8910, lng: 75.3650 },
  'Chalad': { lat: 11.8890, lng: 75.3560 },
  'Mele Chovva': { lat: 11.8760, lng: 75.4020 },
  'Chovva': { lat: 11.8760, lng: 75.4020 },
  'Mattannur': { lat: 11.9186, lng: 75.5727 },
  'Thalassery': { lat: 11.7480, lng: 75.4894 },
  'Payyanur': { lat: 12.1030, lng: 75.2030 },
  'Muzhappilangad': { lat: 11.7944, lng: 75.4433 },
  'Muzhappilangad Drive-In Beach': { lat: 11.7944, lng: 75.4433 },
  'Dharmadam': { lat: 11.7744, lng: 75.4674 },
  'Valapattanam': { lat: 11.9056, lng: 75.3611 },
  'Azhikkal': { lat: 11.9167, lng: 75.3167 },
  'Taliparamba': { lat: 12.0437, lng: 75.3585 },
  'Iritty': { lat: 11.9833, lng: 75.6667 },
  'Edakkad': { lat: 11.8210, lng: 75.4510 },
  'Anjarakandy': { lat: 11.8580, lng: 75.5020 },
  'Chakkarakkal': { lat: 11.8730, lng: 75.4620 },
  'Kuthuparamba': { lat: 11.8270, lng: 75.5680 },
  'Cherukunnu': { lat: 11.9840, lng: 75.3210 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Kozhikode': { lat: 11.2588, lng: 75.7804 },
  'Wayanad': { lat: 11.6854, lng: 76.1320 },
  'allepy': { lat: 9.4981, lng: 76.3388 },
  'Alappuzha': { lat: 9.4981, lng: 76.3388 }
};

export const AppDataContext = createContext();

// Status Mappings
const PROP_STATUS_TO_FRONTEND = {
  available: 'Available',
  under_negotiation: 'Under Negotiation',
  sold: 'Sold',
  rented: 'Rented',
  leased: 'Leased',
  delisted: 'Delisted'
};

const PROP_STATUS_TO_BACKEND = {
  'Available': 'available',
  'Under Negotiation': 'under_negotiation',
  'Sold': 'sold',
  'Rented': 'rented',
  'Leased': 'leased',
  'Delisted': 'delisted'
};

const LEAD_STATUS_TO_FRONTEND = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  not_interested: 'Not Interested',
  closed: 'Closed'
};

const LEAD_STATUS_TO_BACKEND = {
  'New': 'new',
  'Contacted': 'contacted',
  'Interested': 'interested',
  'Not Interested': 'not_interested',
  'Closed': 'closed'
};

export function formatIndianPrice(price, purpose = '') {
  if (price === null || price === undefined || price === '') return 'Price on Request';
  const val = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(val)) return price;

  const isRental = String(purpose).toLowerCase() === 'rent' || String(purpose).toLowerCase() === 'lease';

  if (val >= 10000000) {
    const cr = (val / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹${cr} Cr`;
  }
  if (val >= 100000) {
    const lakh = (val / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${lakh} L${isRental ? ' / mo' : ''}`;
  }
  return `₹${val.toLocaleString('en-IN')}${isRental ? ' / mo' : ''}`;
}

export function mapBackendPropToFrontend(p) {
  let images = [];
  if (p.gallery && p.gallery.length > 0) {
    images = p.gallery.map(g => g.medium_url || g.full_url || g.thumb_url).filter(Boolean);
  } else if (p.cover_photo && (p.cover_photo.medium_url || p.cover_photo.full_url || p.cover_photo.thumb_url)) {
    images = [p.cover_photo.medium_url || p.cover_photo.full_url || p.cover_photo.thumb_url];
  }

  const typeMap = { land: 'Plot', flat: 'Apartment', house: 'House', commercial: 'Commercial', warehouse: 'Commercial' };
  const purposeMap = { sale: 'Sale', rent: 'Rent', lease: 'Lease' };

  return {
    id: p.id,
    title: p.title,
    type: typeMap[p.type] || (p.type ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : 'House'),
    purpose: purposeMap[p.purpose] || (p.purpose ? p.purpose.charAt(0).toUpperCase() + p.purpose.slice(1) : 'Sale'),
    price: p.price,
    priceFormatted: formatIndianPrice(p.price, p.purpose),
    unit: p.price_basis || 'total',
    loc: p.locality,
    imgs: images,
    beds: p.bedrooms,
    baths: p.bathrooms,
    area: p.building_area_sqft ? `${p.building_area_sqft} sq.ft` : null,
    land: p.land_area ? `${p.land_area} ${p.land_area_unit || 'cents'}` : null,
    listed: p.created_at ? p.created_at.split('T')[0] : '',
    status: PROP_STATUS_TO_FRONTEND[p.status] || p.status || 'Available',
    pub: Boolean(p.is_published),
    views: p.view_count || 0,
    leads: 0,
    nego: Boolean(p.negotiable),
    lat: p.latitude !== null && p.latitude !== undefined ? Number(p.latitude) : (LOCALITY_COORDS[p.locality]?.lat || 11.8745),
    lng: p.longitude !== null && p.longitude !== undefined ? Number(p.longitude) : (LOCALITY_COORDS[p.locality]?.lng || 75.3704),
    address: p.address_line || '',
    featured: Boolean(p.is_featured),
    rera: p.rera_number || '',
    cls: p.land_classification || '',
    pros: Array.isArray(p.pros) ? p.pros : (typeof p.pros === 'string' ? JSON.parse(p.pros || '[]') : []),
    cons: Array.isArray(p.cons) ? p.cons : (typeof p.cons === 'string' ? JSON.parse(p.cons || '[]') : []),
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    desc: p.description || '',
    tour: p.virtual_tour_url || null,
    videoUrl: p.video_url || (Array.isArray(p.gallery) ? p.gallery.find(m => m.media_type === 'video')?.video_url : null) || p.virtual_tour_url || null,
    brochureUrl: p.brochure_url || null,
    slug: p.slug,
    media: Array.isArray(p.gallery) ? p.gallery : (p.media || []),
    ownerName: p.owner_details?.name || p.contact_name || p.owner_name || 'KARMA Official',
    ownerPhone: p.owner_details?.phone || p.contact_phone || p.owner_phone || '+91 99957 97450',
    ownerEmail: p.owner_details?.email || p.contact_email || p.owner_email || 'hello@karmarealestate.in',
    ownerNotes: p.owner_details?.notes || p.owner_notes || ''
  };
}

export function mapFrontendPropToBackend(f) {
  const typeMap = { Plot: 'land', Apartment: 'flat', House: 'house', Villa: 'house', Commercial: 'commercial', Warehouse: 'commercial' };
  const purposeMap = { Sale: 'sale', Rent: 'rent', Lease: 'lease' };

  const parsedArea = f.area ? parseFloat(String(f.area).replace(/[^0-9.]/g, '')) : null;
  const parsedLand = f.land ? parseFloat(String(f.land).replace(/[^0-9.]/g, '')) : null;

  return {
    title: f.title,
    type: typeMap[f.type] || f.type?.toLowerCase() || 'house',
    purpose: purposeMap[f.purpose] || f.purpose?.toLowerCase() || 'sale',
    price: parseFloat(f.price) || 0,
    price_basis: f.unit || 'total',
    locality: f.loc || 'Kannur City',
    district: f.district || 'Kannur',
    address_line: f.address || null,
    latitude: f.lat !== undefined && f.lat !== '' && f.lat !== null ? parseFloat(f.lat) : null,
    longitude: f.lng !== undefined && f.lng !== '' && f.lng !== null ? parseFloat(f.lng) : null,
    bedrooms: f.beds ? parseInt(f.beds, 10) : null,
    bathrooms: f.baths ? parseInt(f.baths, 10) : null,
    building_area_sqft: parsedArea,
    land_area: parsedLand,
    land_area_unit: f.landUnit || 'cent',
    status: PROP_STATUS_TO_BACKEND[f.status] || 'available',
    is_published: f.pub !== undefined ? Boolean(f.pub) : true,
    is_featured: Boolean(f.featured),
    negotiable: Boolean(f.nego),
    description: f.desc || '',
    pros: Array.isArray(f.pros) ? f.pros.filter(Boolean) : [],
    cons: Array.isArray(f.cons) ? f.cons.filter(Boolean) : [],
    amenities: Array.isArray(f.amenities) ? f.amenities.filter(Boolean) : [],
    rera_number: f.rera || null,
    land_classification: f.cls || null,
    virtual_tour_url: f.tour || null,
    brochure_url: f.brochureUrl || null,
    owner_name: f.ownerName || null,
    owner_phone: f.ownerPhone || null,
    owner_email: f.ownerEmail || null,
    owner_notes: f.ownerNotes || null
  };
}

export function AppDataProvider({ children }) {
  const [props, setProps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [docs, setDocs] = useState({});
  const [remarks, setRemarks] = useState({});
  const [accessLog, setAccessLog] = useState([]);
  
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Initialize data
  useEffect(() => {
    // 1. Fetch public properties
    api.get('/properties?per_page=50')
      .then(res => {
        if (res.data.success) {
          setProps(res.data.data.map(mapBackendPropToFrontend));
        }
      })
      .catch(err => console.error('Error fetching public properties', err));

    // 2. Check admin auth if token exists
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      api.get('/admin/me')
        .then(res => {
          if (res.data.success) {
            setAdminUser(res.data.admin);
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          setAdminUser(null);
        });
    }

    // 3. Fetch wishlist if lead token exists
    const leadToken = localStorage.getItem('lead_token');
    if (leadToken) {
      const savedLeadData = localStorage.getItem('lead_data');
      let initialUser = { verified: true, name: 'Verified User' };
      if (savedLeadData) {
        try {
          initialUser = { ...JSON.parse(savedLeadData), verified: true };
        } catch (e) {}
      }
      setUser(initialUser);

      api.get('/wishlist')
        .then(res => {
          if (res.data.success) {
            setWishlist(res.data.data.map(w => w.property_id));
          }
        })
        .catch(() => {
          localStorage.removeItem('lead_token');
          localStorage.removeItem('lead_data');
          setUser(null);
        });
    }
  }, []);

  // Fetch admin data when adminUser is set
  const refreshAdminData = useCallback(() => {
    if (!adminUser) return;

    api.get('/admin/properties?per_page=100')
      .then(res => {
        if (res.data.success) {
          setProps(res.data.data.map(mapBackendPropToFrontend));
          // Pre-populate remarks if loaded
          const newRemarks = {};
          res.data.data.forEach(p => {
            if (p.internal_remark) {
              newRemarks[p.id] = p.internal_remark;
            }
          });
          setRemarks(prev => ({ ...prev, ...newRemarks }));
        }
      })
      .catch(err => console.error('Error fetching admin properties', err));

    api.get('/admin/leads')
      .then(res => {
        if (res.data.success) {
          const mappedLeads = res.data.data.map(l => {
            const rawStatus = l.status ? String(l.status).toLowerCase() : 'new';
            return {
              id: l.id,
              name: l.name,
              phone: l.phone,
              email: l.email,
              loc: l.locality,
              first: l.created_at ? l.created_at.split('T')[0] : '',
              status: LEAD_STATUS_TO_FRONTEND[rawStatus] || 'New',
              src: l.source || 'Website',
              props: l.viewed_properties ? l.viewed_properties.map(vp => vp.property_title) : [],
              log: l.activity_timeline ? l.activity_timeline.map(a => ({ t: a.description, w: a.created_at })) : []
            };
          });
          setLeads(mappedLeads);
        }
      })
      .catch(err => console.error('Error fetching admin leads', err));
  }, [adminUser]);

  useEffect(() => {
    if (adminUser) {
      refreshAdminData();
    }
  }, [adminUser, refreshAdminData]);

  // Wishlist toggle
  const toggleWishlist = (id) => {
    const isSaved = wishlist.includes(id);
    setWishlist(prev => isSaved ? prev.filter(pId => pId !== id) : [...prev, id]);

    if (localStorage.getItem('lead_token')) {
      api.post('/wishlist/toggle', { property_id: id }).catch(err => {
        console.error('Failed to toggle wishlist', err);
        setWishlist(prev => !isSaved ? prev.filter(pId => pId !== id) : [...prev, id]);
      });
    } else {
      setShowAuthModal(true);
      setWishlist(prev => isSaved ? prev.filter(pId => pId !== id) : [...prev, id]);
    }
  };

  // Admin Logout
  const logoutAdmin = async () => {
    try {
      await api.post('/admin/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('admin_token');
      setAdminUser(null);
    }
  };

  // Property CRUD & Mutations
  const createProperty = async (propertyData, photoFiles = [], videoFile = null, brochureFile = null) => {
    const payload = mapFrontendPropToBackend(propertyData);
    const res = await api.post('/admin/properties', payload);
    if (res.data.success) {
      const created = res.data.data;
      // Upload photos if any
      if (photoFiles && photoFiles.length > 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          const fd = new FormData();
          fd.append('file', file);
          fd.append('media_type', 'photo');
          if (i === 0) fd.append('is_cover', '1');
          try {
            await api.post(`/admin/properties/${created.id}/media`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (e) {
            console.error('Photo upload failed for index', i, e);
          }
        }
      }
      // Upload real video file to backend storage if any
      if (videoFile) {
        const fd = new FormData();
        fd.append('file', videoFile);
        fd.append('media_type', 'video');
        try {
          await api.post(`/admin/properties/${created.id}/media`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (e) {
          console.error('Video file upload failed', e);
        }
      }
      // Upload real custom PDF brochure to backend storage if any
      if (brochureFile) {
        const fd = new FormData();
        fd.append('file', brochureFile);
        try {
          await api.post(`/admin/properties/${created.id}/brochure`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (e) {
          console.error('Brochure PDF upload failed', e);
        }
      }
      refreshAdminData();
      toast.success('Property created successfully!');
      return created;
    }
    throw new Error(res.data.message || 'Failed to create property');
  };

  const updateProperty = async (id, propertyData, photoFiles = [], videoFile = null, brochureFile = null) => {
    const payload = mapFrontendPropToBackend(propertyData);
    const res = await api.put(`/admin/properties/${id}`, payload);
    if (res.data.success) {
      const updated = res.data.data;
      if (photoFiles && photoFiles.length > 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          const fd = new FormData();
          fd.append('file', file);
          fd.append('media_type', 'photo');
          try {
            await api.post(`/admin/properties/${id}/media`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (e) {
            console.error('Photo upload failed for index', i, e);
          }
        }
      }
      if (videoFile) {
        const fd = new FormData();
        fd.append('file', videoFile);
        fd.append('media_type', 'video');
        try {
          await api.post(`/admin/properties/${id}/media`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (e) {
          console.error('Video file upload failed', e);
        }
      }
      if (brochureFile) {
        const fd = new FormData();
        fd.append('file', brochureFile);
        try {
          await api.post(`/admin/properties/${id}/brochure`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (e) {
          console.error('Brochure PDF upload failed', e);
        }
      }
      refreshAdminData();
      toast.success('Property updated successfully!');
      return updated;
    }
    throw new Error(res.data.message || 'Failed to update property');
  };

  const deleteProperty = async (id) => {
    const res = await api.delete(`/admin/properties/${id}`);
    if (res.data.success) {
      setProps(prev => prev.filter(p => p.id !== id));
      toast.success('Property deleted successfully!');
      return true;
    }
    throw new Error(res.data.message || 'Failed to delete property');
  };

  const deletePropertyMedia = async (mediaId) => {
    try {
      const res = await api.delete(`/admin/media/${mediaId}`);
      if (res.data.success) {
        refreshAdminData();
        toast.info('Media file removed');
        return true;
      }
    } catch (err) {
      console.error('Failed to delete media', err);
      toast.error('Failed to delete media file');
      throw err;
    }
  };

  const uploadPropertyBrochure = async (propertyId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post(`/admin/properties/${propertyId}/brochure`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.data.success) {
      refreshAdminData();
      toast.success('PDF brochure uploaded successfully!');
      return res.data.data?.brochure_url;
    }
  };

  const deletePropertyBrochure = async (propertyId) => {
    const res = await api.delete(`/admin/properties/${propertyId}/brochure`);
    if (res.data.success) {
      refreshAdminData();
      toast.info('PDF brochure deleted.');
      return true;
    }
  };

  const updatePropertyStatus = async (id, newStatus) => {
    const backendStatus = PROP_STATUS_TO_BACKEND[newStatus] || newStatus.toLowerCase().replace(/\s+/g, '_');
    // Optimistic update
    setProps(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    try {
      await api.patch(`/admin/properties/${id}/status`, { status: backendStatus });
      toast.success(`Property marked as ${newStatus}`);
    } catch (err) {
      console.error('Failed to update property status', err);
      toast.error('Failed to update property status');
      refreshAdminData();
    }
  };

  const togglePropertyPublish = async (id, isPublished) => {
    // Optimistic update
    setProps(prev => prev.map(p => p.id === id ? { ...p, pub: isPublished } : p));
    try {
      await api.patch(`/admin/properties/${id}/publish`, { is_published: isPublished });
      toast.success(isPublished ? 'Property published live!' : 'Property unpublished (Draft)');
    } catch (err) {
      console.error('Failed to toggle property publish', err);
      toast.error('Failed to update publish state');
      refreshAdminData();
    }
  };

  // Documents & Remarks Management
  const fetchPropertyDocuments = async (propertyId) => {
    try {
      const res = await api.get(`/admin/properties/${propertyId}`);
      if (res.data.success) {
        const p = res.data.data;
        if (p.confidential_documents) {
          const mappedDocs = p.confidential_documents.map(d => ({
            id: d.id,
            n: d.title || d.original_filename,
            k: d.doc_type === 'floor_plan' ? 'img' : 'doc',
            s: d.file_size_formatted || `${Math.round((d.file_size_bytes || 1024) / 1024)} KB`,
            type: d.doc_type,
            is_watermarked: d.is_watermarked
          }));
          setDocs(prev => ({ ...prev, [propertyId]: mappedDocs }));
        }
        if (p.internal_remark !== undefined) {
          setRemarks(prev => ({ ...prev, [propertyId]: p.internal_remark || '' }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch property details for documents', err);
    }
  };

  const uploadDocument = async (propertyId, { title, doc_type, file, apply_watermark = true }) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    fd.append('doc_type', doc_type);
    fd.append('apply_watermark', apply_watermark ? '1' : '0');

    const res = await api.post(`/admin/properties/${propertyId}/documents`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.data.success) {
      await fetchPropertyDocuments(propertyId);
      toast.success('Confidential document uploaded to vault');
      return res.data.data;
    }
    throw new Error(res.data.message || 'Upload failed');
  };

  const deleteDocument = async (docId, propertyId) => {
    const res = await api.delete(`/admin/documents/${docId}`);
    if (res.data.success) {
      setDocs(prev => ({
        ...prev,
        [propertyId]: (prev[propertyId] || []).filter(d => d.id !== docId)
      }));
      toast.success('Document removed from vault');
      return true;
    }
    throw new Error(res.data.message || 'Failed to delete document');
  };

  const saveRemark = async (propertyId, remarkText) => {
    setRemarks(prev => ({ ...prev, [propertyId]: remarkText }));
    try {
      await api.patch(`/admin/properties/${propertyId}/remarks`, { remark: remarkText });
      toast.success('Internal remark saved');
    } catch (err) {
      console.error('Failed to save remark', err);
      toast.error('Failed to save remark');
    }
  };

  // CRM Lead Mutations
  const updateLeadStatus = async (leadId, newStatus) => {
    const backendStatus = LEAD_STATUS_TO_BACKEND[newStatus] || newStatus.toLowerCase().replace(/\s+/g, '_');
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    try {
      await api.patch(`/admin/leads/${leadId}/status`, { status: backendStatus });
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update lead status', err);
      toast.error('Failed to update lead status');
      refreshAdminData();
    }
  };

  const addLeadNote = async (leadId, noteContent) => {
    const res = await api.post(`/admin/leads/${leadId}/notes`, { note: noteContent });
    if (res.data.success) {
      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          const newEntry = { t: `Note: ${noteContent}`, w: 'Just now' };
          return { ...l, log: [newEntry, ...(l.log || [])] };
        }
        return l;
      }));
      toast.success('Note logged to lead timeline');
      return res.data.data;
    }
    throw new Error(res.data.message || 'Failed to add note');
  };

  const mergeLeads = async (primaryLeadId, duplicateLeadId) => {
    const res = await api.post('/admin/leads/merge', {
      primary_lead_id: primaryLeadId,
      duplicate_lead_id: duplicateLeadId
    });
    if (res.data.success) {
      refreshAdminData();
      toast.success('Leads merged successfully!');
      return res.data.data;
    }
    throw new Error(res.data.message || 'Failed to merge leads');
  };

  const addLead = (lead) => {
    setLeads(prev => [{
      ...lead,
      id: Date.now(),
      status: 'New',
      first: new Date().toISOString().split('T')[0],
      log: [{ t: lead.src || 'New Lead', w: 'Just now' }]
    }, ...prev]);
  };

  return (
    <AppDataContext.Provider value={{
      props, setProps,
      leads, setLeads, addLead,
      docs, setDocs,
      remarks, setRemarks,
      accessLog, setAccessLog,
      wishlist, toggleWishlist,
      user, setUser,
      showAuthModal, setShowAuthModal,
      adminUser, setAdminUser,
      logoutAdmin,
      createProperty, updateProperty, deleteProperty, deletePropertyMedia,
      uploadPropertyBrochure, deletePropertyBrochure,
      updatePropertyStatus, togglePropertyPublish,
      fetchPropertyDocuments, uploadDocument, deleteDocument, saveRemark,
      updateLeadStatus, addLeadNote, mergeLeads,
      refreshAdminData
    }}>
      {children}
    </AppDataContext.Provider>
  );
}
