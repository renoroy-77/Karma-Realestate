import { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AppDataContext, LOCALITY_COORDS, formatIndianPrice, normalizeMediaUrl } from '../../context/AppDataContext';

const AMENITIES_LIST = [
  'Car Parking', '24/7 Security', 'Power Backup', 'Lift / Elevator', 
  'Borewell Water', 'Municipal Water', 'CCTV Surveillance', 'Gated Community', 
  'Waste Management', 'Fire Safety', 'EV Charging', 'Swimming Pool', 
  'Clear Eave Height', 'Loading Docks', 'Visitor Parking', 'Solar Power'
];

const KANNUR_COORDINATE_PRESETS = [
  { name: 'Kannur City Center', lat: 11.8745, lng: 75.3704, loc: 'Kannur City' },
  { name: 'Mattannur Airport (CNN)', lat: 11.9186, lng: 75.5727, loc: 'Mattannur' },
  { name: 'Payyambalam Beach', lat: 11.8680, lng: 75.3520, loc: 'Payyambalam' },
  { name: 'Thalassery Town', lat: 11.7491, lng: 75.4890, loc: 'Thalassery' },
  { name: 'Muzhappilangad Beach', lat: 11.7944, lng: 75.4433, loc: 'Muzhappilangad' },
  { name: 'Thottada Beachside', lat: 11.8150, lng: 75.4120, loc: 'Thottada' },
  { name: 'Talap Commercial Hub', lat: 11.8820, lng: 75.3670, loc: 'Talap' },
  { name: 'South Bazar', lat: 11.8760, lng: 75.3780, loc: 'South Bazar' },
  { name: 'Mele Chovva NH Junction', lat: 11.8885, lng: 75.3995, loc: 'Mele Chovva' }
];

const PRO_SUGGESTIONS = [
  'Only 4.5 km from Kannur International Airport (CNN) cargo gate',
  'Clear 9-meter eave height for vertical racking',
  'Ready for immediate handover',
  'Direct wide National Highway frontage',
  'Uninterrupted 3-phase power & 24/7 sweet borewell water',
  'Clear title with 100% legal clearance verified',
  'Scenic sea view with private coastal road access',
  'Walking distance to Fort Road business hub'
];

const CON_SUGGESTIONS = [
  'Minimum 3-year lock-in period required',
  'Security deposit equivalent to 6 months rent',
  'Strictly non-negotiable pricing structure',
  'Heavy commercial vehicles restricted during peak hours',
  'Common maintenance fee applicable monthly',
  'Modifications require owner written approval'
];

import api from '../../lib/api';

export function getLocalAiSuggestions(formData = {}) {
  const loc = (formData.loc || '').toLowerCase();
  const type = (formData.type || '').toLowerCase();
  const purpose = (formData.purpose || 'Sale').toLowerCase();

  const pros = [];
  const cons = [];

  // Location-based rules
  if (loc.includes('payyambalam') || loc.includes('thottada') || loc.includes('muzhappilangad') || loc.includes('beach') || loc.includes('coastal')) {
    pros.push('Within 500m of the scenic Arabian coastline with soothing sea breeze');
    pros.push('Walking distance to beachfront promenade and recreational zones');
    pros.push('High capital appreciation coastal corridor favored by NRI buyers');
    cons.push('Coastal humid sea air requires anti-corrosion marine exterior paint & fittings');
    cons.push('Higher ground moisture levels during active monsoon seasons');
  } else if (loc.includes('mattannur') || loc.includes('airport') || loc.includes('cnn')) {
    pros.push('Only 5-10 mins direct access to Kannur International Airport (CNN) gates');
    pros.push('Strategic commercial growth node with expanding 4-lane highway infrastructure');
    pros.push('High rental yield demand from airline crew, airport staff, and logistics operators');
    cons.push('Occasional aircraft engine noise along the active flight approach vector');
    cons.push('Higher commercial land acquisition rates compared to eastern rural belts');
  } else if (loc.includes('talap') || loc.includes('pallikkunnu')) {
    pros.push('Prime central residential hub within walking distance of top Kannur hospitals & clinics');
    pros.push('Immediate proximity to prestigious schools, supermarkets, and bank headquarters');
    pros.push('24/7 uninterrupted municipal water supply and underground utility lines');
    cons.push('Moderate daytime traffic congestion along main junction connecting roads');
    cons.push('Premium localized price-per-cent reflecting core urban demand');
  } else if (loc.includes('thalassery')) {
    pros.push('Historic Thalassery cultural hub with excellent railway and maritime connectivity');
    pros.push('Renowned heritage residential corridor with peaceful community surroundings');
    pros.push('Easy access to iconic Thalassery sea bridge, markets, and culinary hubs');
    cons.push('Heritage architectural guidelines may apply to exterior structural expansions');
    cons.push('Narrow arterial side-streets requiring cautious four-wheeler turning access');
  } else if (loc.includes('south bazar') || loc.includes('fort road') || loc.includes('thana') || loc.includes('chovva')) {
    pros.push('Unbeatable central business district location with peak footfall & vehicle exposure');
    pros.push('Direct frontage on prime commercial transit arteries with wide display frontage');
    pros.push('Readily accessible to Kannur Central Railway Station and KSRTC bus terminal');
    cons.push('Strict municipal parking enforcement and peak-hour commercial traffic bottlenecks');
    cons.push('Higher commercial property tax slab under Kannur Municipal Corporation');
  } else if (loc.includes('iritty') || loc.includes('koothuparamba')) {
    pros.push('Elevated flood-free terrain with lush natural greenery and fresh hillside air');
    pros.push('Well connected to Kannur-Mysuru highway economic corridor');
    pros.push('Abundant year-round sweet natural spring well water');
    cons.push('Approx. 35-45 minutes drive from central Kannur Railway Station and coast');
  } else {
    pros.push(`Prime strategically situated location in ${formData.loc || 'Kannur'} with proven rental liquidity`);
    pros.push('Peaceful residential neighborhood with quick connectivity to main arterial roads');
    pros.push('100% legally vetted clear freehold title with encumbrance certificate verified');
    cons.push('Access road may experience slow movement during peak school & office commuting hours');
  }

  // Type-based rules
  if (type.includes('villa') || type.includes('house')) {
    pros.push('Private gated boundary with independent compound wall and generous car porch');
    pros.push('Copious 24/7 sweet borewell and traditional Kerala open-well water reserve');
    cons.push('Independent property maintenance and roof terrace waterproofing responsibility with owner');
  } else if (type.includes('apartment') || type.includes('flat')) {
    pros.push('Gated multi-tier security with automated passenger elevator and 100% DG power backup');
    pros.push('Dedicated covered basement parking slot and dedicated resident association management');
    cons.push('Mandatory monthly resident association maintenance fee (approx ₹2,500 - ₹4,500)');
    cons.push('Shared society common amenities require advance booking for private gatherings');
  } else if (type.includes('commercial') || type.includes('office') || type.includes('shop')) {
    pros.push('Clear road visibility with wide signage frontage for maximum corporate brand exposure');
    pros.push('Heavy-duty 3-phase commercial electrical load connection ready for immediate occupancy');
    cons.push('Commercial electricity tariff and dedicated visitor parking management required');
    cons.push('Interior fitouts and partition alterations require formal owner lease agreement approval');
  } else if (type.includes('warehouse') || type.includes('industrial')) {
    pros.push('Clear 9-meter eave height optimized for heavy multi-tier vertical storage racks');
    pros.push('Wide concrete apron allowing smooth turning for 40-foot multi-axle freight containers');
    cons.push('Heavy commercial vehicle transit restrictions may apply during peak city commuting windows');
  } else if (type.includes('land') || type.includes('plot')) {
    pros.push('Level table land with clearly demarcated boundary stones and 100% clear deeds');
    pros.push('Ready for immediate residential villa or commercial development construction');
    cons.push('Requires fencing upkeep and periodic weed clearing prior to foundation construction');
  }

  // Purpose rules
  if (purpose.includes('rent') || purpose.includes('lease')) {
    cons.push('Standard 11-month or 3-year registered lease agreement with security deposit');
  }

  return {
    pros: Array.from(new Set(pros)).slice(0, 5),
    cons: Array.from(new Set(cons)).slice(0, 3),
    source: 'ai_engine'
  };
}

export default function Properties() {
  const {
    props,
    createProperty,
    updateProperty,
    deleteProperty,
    deletePropertyMedia,
    deletePropertyBrochure,
    updatePropertyStatus,
    togglePropertyPublish
  } = useContext(AppDataContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const [showModal, setShowModal] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('add') === '1';
    }
    return false;
  });
  const [modalMode, setModalMode] = useState('add');
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const s = parseInt(new URLSearchParams(window.location.search).get('step'), 10);
      if (s >= 1 && s <= 5) return s;
    }
    return 1;
  });
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('add') === '1') {
        const loc = sp.get('loc') || 'Kannur City';
        const type = sp.get('type') || 'House';
        const title = sp.get('title') || '';
        const purpose = sp.get('purpose') || 'Sale';
        const addAll = sp.get('add_all') === '1';
        let pros = [];
        let cons = [];
        if (addAll) {
          const sug = getLocalAiSuggestions({ loc, type, purpose, title });
          pros = [...sug.pros];
          cons = [...sug.cons];
        }
        return {
          title,
          loc,
          district: 'Kannur',
          type,
          purpose,
          price: sp.get('price') || '18500000',
          unit: 'total',
          area: '2800',
          land: '12',
          landUnit: 'cent',
          beds: '4',
          baths: '4',
          desc: '',
          status: 'Available',
          pub: true,
          nego: false,
          featured: false,
          lat: 11.8745,
          lng: 75.3704,
          address: '',
          pros,
          cons,
          amenities: [],
          rera: '',
          cls: '',
          tour: '',
          videoUrl: '',
          brochureUrl: '',
          ownerName: 'KARMA Official',
          ownerPhone: '+91 99957 97450',
          ownerEmail: 'hello@karmarealestate.in',
          ownerNotes: '',
          imgs: [],
          media: []
        };
      }
    }
    return {};
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedBrochureFile, setSelectedBrochureFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('ai') === '1') {
        const loc = sp.get('loc') || 'Payyambalam Beach';
        const type = sp.get('type') || 'Villa';
        const purpose = sp.get('purpose') || 'Sale';
        const title = sp.get('title') || 'Luxury Beachside Villa';
        return getLocalAiSuggestions({ loc, type, purpose, title });
      }
    }
    return null;
  });

  // Table Enhancements State
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const brochureInputRef = useRef(null);

  const filteredProps = useMemo(() => {
    if (!searchQuery) return props;
    const q = searchQuery.toLowerCase();
    return props.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.loc?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q)
    );
  }, [props, searchQuery]);

  const sortedProps = useMemo(() => {
    let sortableProps = [...filteredProps];
    sortableProps.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === 'price') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableProps;
  }, [filteredProps, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => setSelectedIds(e.target.checked ? props.map(p => p.id) : []);
  const handleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handlePdfClick = (p) => {
    const propId = typeof p === 'object' ? p.id : p;
    const brochure = typeof p === 'object' ? p.brochureUrl : null;
    if (brochure) {
      window.open(brochure, '_blank');
    } else {
      window.open(`/admin/properties/${propId}/pdf`, '_blank');
    }
  };

  const handlePreviewCustomer = (p) => {
    const slug = p.slug || p.id;
    const type = (p.type || 'house').toLowerCase();
    window.open(`/kannur/${type}/${slug}`, '_blank');
  };

  const openModal = (mode, p = null) => {
    setModalMode(mode);
    setCurrentStep(1);
    setSelectedFiles([]);
    setFilePreviews([]);
    setSelectedBrochureFile(null);
    setSelectedVideoFile(null);
    setErrorMessage('');
    setNewPro('');
    setNewCon('');
    setCustomAmenityInput('');

    if (mode === 'edit' && p) {
      setFormData({
        id: p.id,
        title: p.title || '',
        loc: p.loc || 'Kannur City',
        district: p.district || 'Kannur',
        type: p.type || 'House',
        purpose: p.purpose || 'Sale',
        price: p.price || '',
        unit: p.unit || 'total',
        area: p.area ? String(p.area).replace(/[^0-9.]/g, '') : '',
        land: p.land ? String(p.land).replace(/[^0-9.]/g, '') : '',
        landUnit: 'cent',
        beds: p.beds || '',
        baths: p.baths || '',
        desc: p.desc || '',
        status: p.status || 'Available',
        pub: p.pub !== undefined ? p.pub : true,
        nego: p.nego !== undefined ? p.nego : false,
        featured: p.featured !== undefined ? p.featured : false,
        lat: p.lat !== null && p.lat !== undefined ? p.lat : 11.8745,
        lng: p.lng !== null && p.lng !== undefined ? p.lng : 75.3704,
        address: p.address || '',
        pros: Array.isArray(p.pros) ? [...p.pros] : [],
        cons: Array.isArray(p.cons) ? [...p.cons] : [],
        amenities: Array.isArray(p.amenities) ? [...p.amenities] : [],
        rera: p.rera || '',
        cls: p.cls || '',
        tour: p.tour || '',
        videoUrl: p.videoUrl || (p.media ? p.media.find(m => m.media_type === 'video')?.video_url : '') || p.tour || '',
        brochureUrl: p.brochureUrl || '',
        ownerName: p.ownerName || 'KARMA Official',
        ownerPhone: p.ownerPhone || '+91 99957 97450',
        ownerEmail: p.ownerEmail || 'hello@karmarealestate.in',
        ownerNotes: p.ownerNotes || '',
        imgs: p.imgs ? [...p.imgs] : [],
        media: p.media ? [...p.media] : []
      });
    } else {
      setFormData({
        title: '',
        loc: 'Kannur City',
        district: 'Kannur',
        type: 'House',
        purpose: 'Sale',
        price: '',
        unit: 'total',
        area: '',
        land: '',
        landUnit: 'cent',
        beds: '',
        baths: '',
        desc: '',
        status: 'Available',
        pub: true,
        nego: false,
        featured: false,
        lat: 11.8745,
        lng: 75.3704,
        address: '',
        pros: [],
        cons: [],
        amenities: [],
        rera: '',
        cls: '',
        tour: '',
        videoUrl: '',
        brochureUrl: '',
        ownerName: 'KARMA Official',
        ownerPhone: '+91 99957 97450',
        ownerEmail: 'hello@karmarealestate.in',
        ownerNotes: '',
        imgs: [],
        media: []
      });
    }
    if (typeof window !== 'undefined' && !new URLSearchParams(window.location.search).get('ai')) {
      setAiSuggestions(null);
    }
    setShowModal(true);
  };

  const handleGenerateAiSuggestions = async (overrideData = null) => {
    const dataToUse = overrideData || formData;
    setAiLoading(true);
    try {
      const response = await api.post('/admin/ai/suggest-pros-cons', {
        title: dataToUse.title || '',
        loc: dataToUse.loc || 'Kannur City',
        type: dataToUse.type || 'House',
        purpose: dataToUse.purpose || 'Sale',
        price: dataToUse.price || '',
        area: dataToUse.area || '',
        beds: dataToUse.beds || '',
        baths: dataToUse.baths || '',
        desc: dataToUse.desc || ''
      });

      if (response.data && response.data.success) {
        setAiSuggestions({
          pros: response.data.pros || [],
          cons: response.data.cons || [],
          source: response.data.source || 'ai'
        });
        toast.success(`✨ Generated ${response.data.pros?.length || 0} Pros & ${response.data.cons?.length || 0} Cons for ${dataToUse.loc || 'Kannur'}!`);
      } else {
        throw new Error('API returned unsuccess');
      }
    } catch (err) {
      console.warn('Backend AI endpoint fallback:', err);
      const fallback = getLocalAiSuggestions(dataToUse);
      setAiSuggestions(fallback);
      toast.success(`✨ Generated AI suggestions for ${dataToUse.loc || 'Kannur'}!`);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle URL query parameters to open add modal, switch step, and optionally auto-generate AI suggestions
  useEffect(() => {
    if (searchParams.get('add') === '1') {
      openModal('add');
      const stepParam = parseInt(searchParams.get('step'), 10);
      if (stepParam && stepParam >= 1 && stepParam <= 4) {
        setCurrentStep(stepParam);
      }
      const customLoc = searchParams.get('loc');
      const customTitle = searchParams.get('title');
      const customType = searchParams.get('type');
      if (customLoc || customTitle || customType) {
        setFormData(prev => ({
          ...prev,
          ...(customLoc ? { loc: customLoc } : {}),
          ...(customTitle ? { title: customTitle } : {}),
          ...(customType ? { type: customType } : {})
        }));
      }
      if (searchParams.get('ai') === '1') {
        const payload = {
          title: customTitle || 'Payyambalam Beachfront Luxury Villa',
          loc: customLoc || 'Payyambalam Beach',
          type: customType || 'Villa',
          purpose: 'Sale',
          price: '18500000'
        };
        const instant = getLocalAiSuggestions(payload);
        setAiSuggestions(instant);
        if (searchParams.get('add_all') === '1') {
          setFormData(prev => ({
            ...prev,
            pros: [...instant.pros],
            cons: [...instant.cons]
          }));
        }
      }
    }

    const handleOpenAdd = () => openModal('add');
    window.addEventListener('open-add-property-modal', handleOpenAdd);
    return () => window.removeEventListener('open-add-property-modal', handleOpenAdd);
  }, [searchParams]);

  const handleAddAllAiPros = () => {
    if (!aiSuggestions?.pros?.length) return;
    const existing = new Set(formData.pros || []);
    const toAdd = aiSuggestions.pros.filter(p => !existing.has(p));
    if (toAdd.length > 0) {
      setFormData(prev => ({
        ...prev,
        pros: [...(prev.pros || []), ...toAdd]
      }));
      toast.success(`Added ${toAdd.length} AI highlights!`);
    } else {
      toast.info('All AI highlights are already added.');
    }
  };

  const handleAddAllAiCons = () => {
    if (!aiSuggestions?.cons?.length) return;
    const existing = new Set(formData.cons || []);
    const toAdd = aiSuggestions.cons.filter(c => !existing.has(c));
    if (toAdd.length > 0) {
      setFormData(prev => ({
        ...prev,
        cons: [...(prev.cons || []), ...toAdd]
      }));
      toast.success(`Added ${toAdd.length} AI considerations!`);
    } else {
      toast.info('All AI considerations are already added.');
    }
  };

  const handleAddPro = (textToAdd) => {
    const text = (textToAdd || newPro).trim();
    if (!text) return;
    if (formData.pros?.includes(text)) return;
    setFormData(prev => ({ ...prev, pros: [...(prev.pros || []), text] }));
    setNewPro('');
  };

  const handleRemovePro = (index) => {
    setFormData(prev => ({ ...prev, pros: prev.pros.filter((_, i) => i !== index) }));
  };

  const handleAddCon = (textToAdd) => {
    const text = (textToAdd || newCon).trim();
    if (!text) return;
    if (formData.cons?.includes(text)) return;
    setFormData(prev => ({ ...prev, cons: [...(prev.cons || []), text] }));
    setNewCon('');
  };

  const handleRemoveCon = (index) => {
    setFormData(prev => ({ ...prev, cons: prev.cons.filter((_, i) => i !== index) }));
  };

  const [customAmenityInput, setCustomAmenityInput] = useState('');

  const handleAddCustomAmenity = (e) => {
    if (e) e.preventDefault();
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;
    if (!formData.amenities?.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), trimmed]
      }));
    }
    setCustomAmenityInput('');
  };

  const handleToggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities?.includes(amenity);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter(a => a !== amenity) : [...(prev.amenities || []), amenity]
      };
    });
  };

  const [geocoding, setGeocoding] = useState(false);

  const geocodeAddress = async (queryText) => {
    const q = (queryText || formData.address || formData.loc || '').trim();
    if (!q) return;

    // 1. Check local preset/coords dictionary first
    const lower = q.toLowerCase();
    for (const [k, coords] of Object.entries(LOCALITY_COORDS)) {
      if (lower === k.toLowerCase() || lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)) {
        setFormData(prev => ({
          ...prev,
          lat: coords.lat,
          lng: coords.lng
        }));
        return;
      }
    }

    // 2. Fetch from Nominatim geocoder
    setGeocoding(true);
    try {
      const searchTarget = q.toLowerCase().includes('kannur') || q.toLowerCase().includes('kerala')
        ? q
        : `${q}, Kannur, Kerala`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTarget)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        if (!isNaN(foundLat) && !isNaN(foundLng)) {
          setFormData(prev => ({
            ...prev,
            lat: Number(foundLat.toFixed(6)),
            lng: Number(foundLng.toFixed(6))
          }));
        }
      }
    } catch (e) {
      console.warn('Geocoding error:', e);
    } finally {
      setGeocoding(false);
    }
  };

  const handleLocalitySelect = (locName) => {
    if (!locName) {
      setFormData(prev => ({ ...prev, loc: '' }));
      return;
    }
    let matchedCoords = LOCALITY_COORDS[locName];
    let matchedName = locName;

    if (!matchedCoords) {
      const lower = locName.trim().toLowerCase();
      const foundKey = Object.keys(LOCALITY_COORDS).find(
        k => k.toLowerCase() === lower || lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
      );
      if (foundKey) {
        matchedCoords = LOCALITY_COORDS[foundKey];
      }
    }

    setFormData(prev => ({
      ...prev,
      loc: matchedName,
      ...(matchedCoords ? { lat: matchedCoords.lat, lng: matchedCoords.lng } : {})
    }));

    if (!matchedCoords && locName.trim().length > 3) {
      geocodeAddress(locName);
    }
  };

  const handleApplyPresetCoords = (preset) => {
    setFormData(prev => ({
      ...prev,
      loc: preset.loc || preset.name.split(' ')[0],
      lat: preset.lat,
      lng: preset.lng
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveNewFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (index) => {
    const imgToRemove = formData.imgs?.[index];
    const mediaItem = (formData.media || []).find(m => 
      m.medium_url === imgToRemove || 
      m.full_url === imgToRemove || 
      m.thumb_url === imgToRemove
    );

    if (mediaItem && mediaItem.id) {
      try {
        await deletePropertyMedia(mediaItem.id);
      } catch (err) {
        console.warn('Failed to delete media from backend', err);
      }
    }

    setFormData(prev => ({
      ...prev,
      imgs: (prev.imgs || []).filter((_, i) => i !== index),
      media: (prev.media || []).filter(m => m.id !== mediaItem?.id)
    }));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.title?.trim() || formData.price === '' || formData.price === undefined) {
      setErrorMessage('Please provide a property title and price in Step 1.');
      setCurrentStep(1);
      return false;
    }

    setSaving(true);
    setErrorMessage('');

    const finalLat = formData.lat !== undefined && formData.lat !== '' && !isNaN(Number(formData.lat))
      ? Number(formData.lat)
      : (LOCALITY_COORDS[formData.loc]?.lat || 11.8745);
    const finalLng = formData.lng !== undefined && formData.lng !== '' && !isNaN(Number(formData.lng))
      ? Number(formData.lng)
      : (LOCALITY_COORDS[formData.loc]?.lng || 75.3704);

    const payload = {
      ...formData,
      lat: finalLat,
      lng: finalLng
    };

    try {
      if (modalMode === 'add') {
        await createProperty(payload, selectedFiles, selectedVideoFile, selectedBrochureFile);
      } else {
        await updateProperty(payload.id, payload, selectedFiles, selectedVideoFile, selectedBrochureFile);
      }
      setSelectedFiles([]);
      setFilePreviews([]);
      setSelectedVideoFile(null);
      setSelectedBrochureFile(null);
      setShowModal(false);
      return true;
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to save property. Please check the fields.';
      setErrorMessage(msg);
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleStepSave = async (nextStepTarget) => {
    // If title or price are missing on step 1, prompt user and stay on step 1
    if (!formData.title?.trim() || formData.price === '' || formData.price === undefined) {
      setErrorMessage('Please enter a property title and price in Step 1 before proceeding.');
      setCurrentStep(1);
      return false;
    }

    setSaving(true);
    setErrorMessage('');

    const finalLat = formData.lat !== undefined && formData.lat !== '' && !isNaN(Number(formData.lat))
      ? Number(formData.lat)
      : (LOCALITY_COORDS[formData.loc]?.lat || 11.8745);
    const finalLng = formData.lng !== undefined && formData.lng !== '' && !isNaN(Number(formData.lng))
      ? Number(formData.lng)
      : (LOCALITY_COORDS[formData.loc]?.lng || 75.3704);

    const payload = {
      ...formData,
      lat: finalLat,
      lng: finalLng
    };

    try {
      let savedProp;
      if (modalMode === 'add') {
        savedProp = await createProperty(payload, selectedFiles, selectedVideoFile, selectedBrochureFile, { silent: true });
        setModalMode('edit');
        setFormData(prev => ({
          ...prev,
          id: savedProp.id,
          slug: savedProp.slug
        }));
      } else {
        savedProp = await updateProperty(payload.id, payload, selectedFiles, selectedVideoFile, selectedBrochureFile, { silent: true });
      }

      // If files were uploaded, clear pending file state
      if (selectedFiles.length > 0 || selectedVideoFile || selectedBrochureFile) {
        setSelectedFiles([]);
        setFilePreviews([]);
        setSelectedVideoFile(null);
        setSelectedBrochureFile(null);
      }

      if (savedProp?.gallery && savedProp.gallery.length > 0) {
        const imgs = savedProp.gallery.map(g => normalizeMediaUrl(g.medium_url || g.full_url || g.thumb_url)).filter(Boolean);
        setFormData(prev => ({
          ...prev,
          imgs,
          media: savedProp.gallery
        }));
      }

      toast.success('Changes saved automatically', { duration: 1500 });
      if (nextStepTarget) {
        setCurrentStep(nextStepTarget);
      }
      return true;
    } catch (err) {
      console.error('Step auto-save error:', err);
      const msg = err.response?.data?.message || err.message || 'Auto-save failed.';
      setErrorMessage(msg);
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExistingBrochure = async () => {
    if (formData.id) {
      try {
        await deletePropertyBrochure(formData.id);
      } catch (err) {
        console.warn('Failed to delete brochure from storage', err);
      }
    }
    setFormData(prev => ({ ...prev, brochureUrl: '' }));
  };

  const handleRemoveExistingVideo = async () => {
    if (formData.id) {
      const videoMedia = (formData.media || []).find(m => m.media_type === 'video');
      if (videoMedia && videoMedia.id) {
        try {
          await api.delete(`/admin/media/${videoMedia.id}`);
        } catch (err) {
          console.warn('Failed to delete video media from storage', err);
        }
      }
    }
    setFormData(prev => ({ 
      ...prev, 
      videoUrl: '', 
      tour: '', 
      media: (prev.media || []).filter(m => m.media_type !== 'video') 
    }));
  };

  const handleDeleteOne = (id, title) => {
    toast(`Delete "${title}"?`, {
      description: 'This listing will be permanently removed from the website.',
      action: {
        label: 'Delete',
        onClick: async () => {
          const tId = toast.loading('Deleting property...');
          try {
            await deleteProperty(id);
            toast.success(`"${title}" deleted successfully`, { id: tId });
          } catch (err) {
            toast.error('Failed to delete property: ' + (err.message || 'Error'), { id: tId });
          }
        }
      },
      cancel: {
        label: 'Cancel'
      },
      duration: 6000
    });
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    toast(`Delete ${selectedIds.length} properties?`, {
      description: 'All selected listings will be deleted.',
      action: {
        label: `Delete (${selectedIds.length})`,
        onClick: async () => {
          const tId = toast.loading(`Deleting ${selectedIds.length} properties...`);
          try {
            for (const id of selectedIds) {
              await deleteProperty(id);
            }
            setSelectedIds([]);
            toast.success('Selected properties deleted', { id: tId });
          } catch (e) {
            toast.error('Failed to delete some properties', { id: tId });
          }
        }
      },
      cancel: {
        label: 'Cancel'
      },
      duration: 6000
    });
  };

  return (
    <div className="admin-theme">
      <div className="panel">
        <div className="panel-hd">
          <div>
            <h3>All properties · {props.length}</h3>
            <p>Direct updates to database — changes reflect immediately on public site</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="search-in" style={{ width: '220px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
              </svg>
              <input
                placeholder="Search title, locality..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-blue btn-sm" onClick={() => openModal('add')}>+ Add property</button>
          </div>
        </div>

        <div className="table-scroll">
          {selectedIds.length > 0 && (
            <div style={{ padding: '12px 16px', background: 'var(--bg-soft)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <b>{selectedIds.length} selected</b>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 13, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={handleBulkDelete}>
                Delete Selected
              </button>
            </div>
          )}
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === props.length && props.length > 0} />
                </th>
                <th></th>
                <th onClick={() => requestSort('title')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Property {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('purpose')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Purpose {sortConfig.key === 'purpose' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('price')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Price {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('pub')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Live {sortConfig.key === 'pub' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProps.length > 0 ? sortedProps.map(p => (
                <tr key={p.id} className={selectedIds.includes(p.id) ? 'selected-row' : ''}>
                  <td>
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => handleSelectOne(p.id)} />
                  </td>
                  <td>
                    <div className="thumb" style={p.imgs?.[0] ? { backgroundImage: `url(${normalizeMediaUrl(p.imgs[0])})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}></div>
                  </td>
                  <td className="td-main">
                    <b>{p.title}</b>
                    <span>{p.type} · {p.loc} · listed {p.listed}{p.rera ? ' · K-RERA ✓' : ''}{p.cls ? ' · ' + p.cls : ''}</span>
                  </td>
                  <td>
                    <span className={`pill ${p.purpose === 'Sale' ? 'blue' : p.purpose === 'Rent' ? 'green' : 'amber'}`}>
                      {p.purpose}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{p.priceFormatted || formatIndianPrice(p.price, p.purpose)}</td>
                  <td>
                    <select
                      className="pill-sel"
                      value={p.status}
                      onChange={(e) => updatePropertyStatus(p.id, e.target.value)}
                    >
                      {['Available', 'Under Negotiation', 'Sold', 'Rented', 'Leased', 'Delisted'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <label className="check-line" style={{ padding: 0, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={p.pub}
                        onChange={(e) => togglePropertyPublish(p.id, e.target.checked)}
                      /> 
                      <span style={{ fontSize: '12px', color: p.pub ? 'var(--blue)' : 'var(--ink-2)', fontWeight: p.pub ? 600 : 400 }}>
                        {p.pub ? 'Live' : 'Hidden'}
                      </span>
                    </label>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="Preview on website" onClick={() => handlePreviewCustomer(p)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button className="icon-btn" title="Edit property" onClick={() => openModal('edit', p)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button 
                        className="icon-btn" 
                        title={p.brochureUrl ? "Open Stored Official PDF Brochure" : "Generate branded PDF brochure"} 
                        onClick={() => handlePdfClick(p)}
                        style={p.brochureUrl ? { color: '#059669', background: '#ecfdf5' } : {}}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M12 18v-6m0 6-2.5-2.5M12 18l2.5-2.5"/></svg>
                      </button>
                      <button className="icon-btn" title="Delete property" style={{ color: 'var(--red)' }} onClick={() => handleDeleteOne(p.id, p.title)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-2)' }}>
                    {searchQuery ? 'No properties match your search term.' : 'No properties listed yet. Click "+ Add property" to create your first listing.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--ink-2)', padding: '0 4px' }}>
        Status and publish changes sync to the Laravel backend immediately. Branded PDF export creates a shareable brochure with KARMA watermark.
      </p>

      {/* Add/Edit Modal */}
      {showModal && (() => {
        const STEPS = [
          { id: 1, title: 'Overview & Pricing' },
          { id: 2, title: 'The Honest View' },
          { id: 3, title: 'Google Maps & Location' },
          { id: 4, title: 'Contact & Agent' },
          { id: 5, title: 'Specs, Video & Brochure' }
        ];

        const activeLat = (formData.lat !== undefined && formData.lat !== '' && formData.lat !== null && !isNaN(Number(formData.lat)))
          ? Number(formData.lat)
          : (LOCALITY_COORDS[formData.loc]?.lat || 11.8745);
        const activeLng = (formData.lng !== undefined && formData.lng !== '' && formData.lng !== null && !isNaN(Number(formData.lng)))
          ? Number(formData.lng)
          : (LOCALITY_COORDS[formData.loc]?.lng || 75.3704);
        const liveMapUrl = `https://maps.google.com/maps?q=${activeLat},${activeLng}&hl=en&z=15&output=embed`;

        return (
          <div className="overlay" onClick={(e) => e.target.className.includes('overlay') && !saving && setShowModal(false)} style={{ zIndex: 100 }}>
            <div className="admin-prop-modal" onClick={e => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div style={{ padding: '22px 28px 18px', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                    {modalMode === 'add' ? 'Add New Property Listing' : `Edit Property: ${formData.title || 'Untitled'}`}
                  </h2>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#64748b' }}>
                    Fill in the details to publish your property.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="modal-x" 
                  onClick={() => !saving && setShowModal(false)}
                  style={{ fontSize: 20, color: '#64748b', cursor: 'pointer', background: 'none', border: 'none', padding: 4 }}
                >
                  ✕
                </button>
              </div>

              {/* Stepper Bar (5 Numbered Steps, Connected by Lines, Clean Modern Style) */}
              <div style={{ padding: '14px 28px', borderBottom: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {STEPS.map((step, idx) => {
                  const isActive = currentStep === step.id;
                  const isDone = currentStep > step.id;
                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: idx === STEPS.length - 1 ? 'none' : 1 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (saving) return;
                          if (step.id === currentStep) return;
                          if (formData.title && formData.price) {
                            handleStepSave(step.id);
                          } else {
                            setCurrentStep(step.id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: isActive ? '#065f46' : isDone ? '#059669' : '#f1f5f9',
                          color: isActive || isDone ? '#ffffff' : '#64748b',
                          border: isActive || isDone ? 'none' : '1px solid #cbd5e1',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          transition: 'all 0.2s'
                        }}>
                          {isDone ? '✓' : step.id}
                        </div>
                        <span style={{
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#0f172a' : '#64748b',
                          whiteSpace: 'nowrap',
                          transition: 'color 0.2s'
                        }}>
                          {step.title}
                        </span>
                      </button>
                      {idx < STEPS.length - 1 && (
                        <div style={{
                          flex: 1,
                          height: 1.5,
                          background: isDone ? '#059669' : '#e2e8f0',
                          margin: '0 12px',
                          transition: 'background 0.2s'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-bd" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                  {errorMessage && (
                    <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '12px 16px', borderRadius: 12, marginBottom: 18, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <div>{errorMessage}</div>
                    </div>
                  )}

                  {/* STEP 1: OVERVIEW & PRICING (2-COLUMN BALANCED LAYOUT) */}
                  {currentStep === 1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
                      {/* Left Column: Basic Details & Visibility */}
                      <div>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', color: '#065f46', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            </div>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Basic Details</div>
                              <div style={{ fontSize: 12.5, color: '#64748b' }}>Add the main information about your property.</div>
                            </div>
                          </div>

                          <div className="fld">
                            <label>Property Title *</label>
                            <input
                              required
                              value={formData.title || ''}
                              onChange={e => setFormData({ ...formData, title: e.target.value })}
                              placeholder="e.g. Skyline View 3BHK Penthouse in Pallikkunnu"
                              style={{ fontSize: 14.5, fontWeight: 500 }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <div className="fld">
                              <label>Property Purpose</label>
                              <select value={formData.purpose || 'Sale'} onChange={e => setFormData({ ...formData, purpose: e.target.value })}>
                                <option value="Sale">Sale (Buy)</option>
                                <option value="Rent">Rent</option>
                                <option value="Lease">Lease (Long Term)</option>
                              </select>
                            </div>

                            <div className="fld">
                              <label>Property Type</label>
                              <select value={formData.type || 'House'} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option value="Apartment">Apartment</option>
                                <option value="House">House / Villa</option>
                                <option value="Plot">Plot / Land</option>
                                <option value="Commercial">Commercial Building</option>
                                <option value="Warehouse">Warehouse / Logistics</option>
                              </select>
                            </div>

                            <div className="fld">
                              <label>Locality *</label>
                              <select
                                value={formData.loc || 'Kannur City'}
                                onChange={e => handleLocalitySelect(e.target.value)}
                                style={{ width: '100%' }}
                              >
                                {Object.keys(LOCALITY_COORDS).map(locName => (
                                  <option key={locName} value={locName}>{locName}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 4 }}>
                            <div className="fld">
                              <label>Price in Rupees (₹) *</label>
                              <input
                                type="number"
                                step="any"
                                required
                                value={formData.price || ''}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="e.g. 220000 for ₹2.20L or 39000000 f..."
                              />
                              {formData.price && (
                                <div style={{ fontSize: 11.5, color: '#0071e3', fontWeight: 600, marginTop: 4 }}>
                                  {formatIndianPrice(formData.price, formData.purpose)}
                                </div>
                              )}
                            </div>

                            <div className="fld">
                              <label>Price Basis</label>
                              <select value={formData.unit || 'total'} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                <option value="total">Total Amount</option>
                                <option value="per_month">Per Month</option>
                                <option value="per_sqft">Per Sq.ft</option>
                                <option value="per_cent">Per Cent</option>
                              </select>
                            </div>

                            <div className="fld">
                              <label>Availability Status</label>
                              <select value={formData.status || 'Available'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="Available">Available</option>
                                <option value="Under Negotiation">Under Negotiation</option>
                                <option value="Sold">Sold</option>
                                <option value="Rented">Rented</option>
                                <option value="Leased">Leased</option>
                                <option value="Delisted">Delisted</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Visibility & Listing Options */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 6, background: '#dcfce7', color: '#166534', display: 'grid', placeItems: 'center' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>Visibility & Listing Options</div>
                              <div style={{ fontSize: 11.5, color: '#15803d' }}>Control where your property will be visible.</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                              <input
                                type="checkbox"
                                checked={Boolean(formData.pub)}
                                onChange={e => setFormData({ ...formData, pub: e.target.checked })}
                                style={{ width: 16, height: 16, accentColor: '#065f46' }}
                              />
                              <span>Published on Public Website</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                              <input
                                type="checkbox"
                                checked={Boolean(formData.featured)}
                                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                style={{ width: 16, height: 16, accentColor: '#065f46' }}
                              />
                              <span>⭐ Featured on Homepage</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                              <input
                                type="checkbox"
                                checked={Boolean(formData.nego)}
                                onChange={e => setFormData({ ...formData, nego: e.target.checked })}
                                style={{ width: 16, height: 16, accentColor: '#065f46' }}
                              />
                              <span>🏷️ Price Negotiable</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Upload Images, Presets, Live Map Preview */}
                      <div>
                        {/* Upload Property Images */}
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const files = Array.from(e.dataTransfer.files || []);
                            if (!files.length) return;
                            setSelectedFiles(prev => [...prev, ...files]);
                            const newPreviews = files.map(file => URL.createObjectURL(file));
                            setFilePreviews(prev => [...prev, ...newPreviews]);
                          }}
                          style={{
                            border: '1.5px dashed #cbd5e1',
                            borderRadius: 14,
                            padding: '16px',
                            textAlign: 'center',
                            background: '#fafafa',
                            cursor: 'pointer'
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            accept="image/*"
                            style={{ display: 'none' }}
                          />
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'grid', placeItems: 'center', margin: '0 auto 6px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                          </div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>Upload Property Images</div>
                          <div style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 6px' }}>Drag & drop images or click to browse<br/>Supports JPG, PNG, WebP (Max 10MB each)</div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 99,
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#065f46',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span>Upload Images</span>
                          </button>
                        </div>

                        {/* Thumbnail Strip with Cancel / Remove Button */}
                        {(() => {
                          const existingList = (formData.imgs || []).map((url, idx) => ({
                            url: normalizeMediaUrl(url),
                            isNew: false,
                            idx
                          }));
                          const newList = (filePreviews || []).map((url, idx) => ({
                            url,
                            isNew: true,
                            idx
                          }));
                          const allItems = [...existingList, ...newList];

                          if (allItems.length === 0) return null;

                          return (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12, color: '#64748b' }}>
                                <span style={{ fontWeight: 600 }}>{allItems.length} photo{allItems.length > 1 ? 's' : ''} uploaded</span>
                                <span style={{ fontSize: 11 }}>Hover & click ✕ to remove</span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                {allItems.map((item, i) => (
                                  <div
                                    key={`${item.isNew ? 'new' : 'ext'}-${item.idx}`}
                                    style={{
                                      position: 'relative',
                                      aspectRatio: '1',
                                      borderRadius: 8,
                                      overflow: 'hidden',
                                      border: '1.5px solid #e2e8f0',
                                      background: '#f8fafc',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                    }}
                                  >
                                    <img
                                      src={item.isNew ? item.url : normalizeMediaUrl(item.url)}
                                      alt={`Photo ${i + 1}`}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />

                                    {/* Cover Badge on First Photo */}
                                    {i === 0 && (
                                      <span style={{
                                        position: 'absolute',
                                        bottom: 3,
                                        left: 3,
                                        background: 'rgba(6, 95, 70, 0.9)',
                                        color: '#fff',
                                        fontSize: 9,
                                        fontWeight: 700,
                                        padding: '1px 5px',
                                        borderRadius: 3,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em'
                                      }}>
                                        Cover
                                      </span>
                                    )}

                                    {/* Cancel / Remove Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (item.isNew) {
                                          handleRemoveNewFile(item.idx);
                                        } else {
                                          handleRemoveExistingImage(item.idx);
                                        }
                                      }}
                                      title="Remove this photo"
                                      style={{
                                        position: 'absolute',
                                        top: 3,
                                        right: 3,
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        color: '#ffffff',
                                        border: '1px solid rgba(255,255,255,0.4)',
                                        cursor: 'pointer',
                                        display: 'grid',
                                        placeItems: 'center',
                                        fontSize: 11,
                                        fontWeight: 800,
                                        padding: 0,
                                        zIndex: 10,
                                        transition: 'all 0.15s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#ef4444';
                                        e.currentTarget.style.transform = 'scale(1.15)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Quick Location Presets */}
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginTop: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span>Quick Location Presets</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {KANNUR_COORDINATE_PRESETS.slice(0, 4).map((preset, idx) => {
                              const isSelected = formData.loc === preset.loc;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleApplyPresetCoords(preset)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '7px 8px',
                                    background: isSelected ? '#ecfdf5' : '#f8fafc',
                                    border: isSelected ? '1.5px solid #059669' : '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 11.5,
                                    fontWeight: isSelected ? 700 : 500,
                                    color: isSelected ? '#065f46' : '#334155',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  <span style={{ color: '#ef4444' }}>📍</span>
                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preset.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Live Map Preview */}
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginTop: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>Live Map Preview</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${activeLat},${activeLng}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: 11.5, color: '#0071e3', fontWeight: 600, textDecoration: 'none' }}
                            >
                              Open in Google Maps ↗
                            </a>
                          </div>
                          <div style={{ height: 160, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f1f5f9' }}>
                            <iframe
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={liveMapUrl}
                              title="Live Map Preview"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: THE HONEST VIEW (PROS & CONS) */}
                  {currentStep === 2 && (
                    <div>
                      {/* AI Assistant Banner */}
                      <div className="admin-ai-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                            ✨
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <b style={{ color: '#065f46', fontSize: 15 }}>KARMA AI Assistant</b>
                              <span className="admin-ai-badge">Groq LLaMA 3.3 + Kannur Engine</span>
                            </div>
                            <p style={{ color: '#047857', fontSize: 12.5, margin: '2px 0 0', lineHeight: 1.4 }}>
                              Analyzes <b>{formData.loc || 'Kannur'}</b>, <b>{formData.type || 'Property'}</b> ({formData.purpose || 'Sale'}) to generate authentic localized Pros and honest Considerations.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          id="btn-generate-ai-pros-cons"
                          onClick={handleGenerateAiSuggestions}
                          disabled={aiLoading}
                          className="btn btn-primary"
                          style={{
                            background: aiLoading ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 600,
                            padding: '10px 18px',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                            cursor: aiLoading ? 'not-allowed' : 'pointer',
                            fontSize: 13
                          }}
                        >
                          {aiLoading ? (
                            <>
                              <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                              Analyzing with AI...
                            </>
                          ) : (
                            <>
                              <span>✨</span>
                              <span>Generate with AI</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 18px', borderRadius: 14, marginBottom: 18 }}>
                        <b style={{ color: '#166534', fontSize: 14 }}>The Honest View (Verified by KARMA)</b>
                        <p style={{ color: '#14532d', fontSize: 12.5, margin: '3px 0 0', lineHeight: 1.4 }}>
                          KARMA's hallmark transparency feature. Buyers value genuine pros and honest considerations. These are displayed directly on the public property page.
                        </p>
                      </div>

                      {/* What We Love (Pros) */}
                      <div className="admin-section-card" style={{ borderColor: '#86efac', background: '#fcfdfc' }}>
                        <div className="admin-section-title" style={{ color: '#166534' }}>
                          <span>✨ What We Love (Verified Pros & Highlights)</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#15803d' }}>({formData.pros?.length || 0} highlights)</span>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, minHeight: 32 }}>
                          {formData.pros && formData.pros.length > 0 ? (
                            formData.pros.map((pro, idx) => (
                              <div key={idx} className="admin-item-chip pro">
                                <span>✓ {pro}</span>
                                <button type="button" onClick={() => handleRemovePro(idx)} title="Remove">✕</button>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No highlights added yet. Add below, click AI suggestions, or choose quick suggestions.</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={newPro}
                            onChange={e => setNewPro(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPro(); }}}
                            placeholder="Type a highlight (e.g. Only 4.5 km from Airport cargo gate) and press Add..."
                            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #cbd5e1' }}
                          />
                          <button type="button" className="btn btn-outline btn-sm" style={{ color: '#15803d', borderColor: '#86efac' }} onClick={() => handleAddPro()}>
                            + Add Pro
                          </button>
                        </div>

                        {/* AI Generated Pros Chips */}
                        {aiSuggestions?.pros?.length > 0 && (
                          <div style={{ marginTop: 14, padding: '12px 14px', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>✨</span> AI SUGGESTIONS FOR {formData.loc ? formData.loc.toUpperCase() : 'THIS PROPERTY'} ({aiSuggestions.pros.length}):
                              </span>
                              <button
                                type="button"
                                onClick={handleAddAllAiPros}
                                style={{ background: 'none', border: 'none', color: '#059669', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                              >
                                + Add All AI Pros
                              </button>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {aiSuggestions.pros.map((sug, i) => {
                                const isAdded = formData.pros?.includes(sug);
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    disabled={isAdded}
                                    className={`admin-ai-chip ${isAdded ? 'added' : ''}`}
                                    onClick={() => !isAdded && handleAddPro(sug)}
                                    title={isAdded ? 'Already added' : 'Click to add'}
                                  >
                                    {isAdded ? '✓ Added' : `+ ${sug}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div style={{ marginTop: 14 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Quick suggestions (Click to add):</span>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                            {PRO_SUGGESTIONS.map((sug, i) => (
                              <button key={i} type="button" className="admin-quick-chip" onClick={() => handleAddPro(sug)}>
                                + {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Keep In Mind (Cons) */}
                      <div className="admin-section-card" style={{ borderColor: '#fca5a5', background: '#fefcfc', marginTop: 18 }}>
                        <div className="admin-section-title" style={{ color: '#991b1b' }}>
                          <span>⚠️ Keep In Mind (Honest Considerations)</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#b91c1c' }}>({formData.cons?.length || 0} considerations)</span>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, minHeight: 32 }}>
                          {formData.cons && formData.cons.length > 0 ? (
                            formData.cons.map((con, idx) => (
                              <div key={idx} className="admin-item-chip con">
                                <span>• {con}</span>
                                <button type="button" onClick={() => handleRemoveCon(idx)} title="Remove">✕</button>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No considerations added yet. Add below, click AI suggestions, or choose quick suggestions.</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={newCon}
                            onChange={e => setNewCon(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCon(); }}}
                            placeholder="Type a consideration (e.g. Minimum 3-year lock-in period required) and press Add..."
                            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #cbd5e1' }}
                          />
                          <button type="button" className="btn btn-outline btn-sm" style={{ color: '#b91c1c', borderColor: '#fca5a5' }} onClick={() => handleAddCon()}>
                            + Add Con
                          </button>
                        </div>

                        {/* AI Generated Cons Chips */}
                        {aiSuggestions?.cons?.length > 0 && (
                          <div style={{ marginTop: 14, padding: '12px 14px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>⚠️</span> AI HONEST CONSIDERATIONS ({aiSuggestions.cons.length}):
                              </span>
                              <button
                                type="button"
                                onClick={handleAddAllAiCons}
                                style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                              >
                                + Add All AI Cons
                              </button>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {aiSuggestions.cons.map((sug, i) => {
                                const isAdded = formData.cons?.includes(sug);
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    disabled={isAdded}
                                    className={`admin-ai-chip con ${isAdded ? 'added' : ''}`}
                                    onClick={() => !isAdded && handleAddCon(sug)}
                                    title={isAdded ? 'Already added' : 'Click to add'}
                                  >
                                    {isAdded ? '✓ Added' : `+ ${sug}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div style={{ marginTop: 14 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Quick suggestions (Click to add):</span>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                            {CON_SUGGESTIONS.map((sug, i) => (
                              <button key={i} type="button" className="admin-quick-chip" onClick={() => handleAddCon(sug)}>
                                + {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: GOOGLE MAPS & LOCATION (VISIBLE LAT & LONG INPUTS + REAL-TIME PIN SYNC) */}
                  {currentStep === 3 && (
                    <div>
                      {/* Top Info Banner */}
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 18px', borderRadius: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#dcfce7', color: '#166534', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div>
                          <b style={{ color: '#166534', fontSize: 14 }}>Google Maps & Accurate Navigation</b>
                          <p style={{ color: '#15803d', fontSize: 12.5, margin: '2px 0 0', lineHeight: 1.4 }}>
                            Set exact GPS coordinates so verified customers can view the location pin on Google Maps and navigate directly.
                          </p>
                        </div>
                      </div>

                      {/* 1-Click Kannur Landmark Presets */}
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                          1-Click Kannur Landmark Presets:
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {KANNUR_COORDINATE_PRESETS.map((preset, idx) => {
                            const isMatch = formData.loc === preset.loc || (formData.lat === preset.lat && formData.lng === preset.lng);
                            return (
                              <button
                                key={idx}
                                type="button"
                                className="admin-quick-chip"
                                style={{
                                  background: isMatch ? '#ecfdf5' : '#f8fafc',
                                  border: isMatch ? '1.5px solid #059669' : '1px solid #e2e8f0',
                                  color: isMatch ? '#065f46' : '#334155',
                                  fontWeight: isMatch ? 700 : 500,
                                  padding: '5px 10px',
                                  fontSize: 12,
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5
                                }}
                                onClick={() => handleApplyPresetCoords(preset)}
                              >
                                <span style={{ color: '#ef4444' }}>📍</span>
                                <span>{preset.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2-Column: Locality / Area & Exact Address Line */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
                        <div className="fld" style={{ margin: 0 }}>
                          <label>Locality / Area *</label>
                          <input
                            required
                            value={formData.loc || ''}
                            onChange={e => handleLocalitySelect(e.target.value)}
                            placeholder="e.g. Kannur City, Muzhappilangad, Chalad"
                            list="kannur-localities-datalist"
                            style={{ fontSize: 14, fontWeight: 500 }}
                          />
                          <datalist id="kannur-localities-datalist">
                            {Object.keys(LOCALITY_COORDS).map(locName => (
                              <option key={locName} value={locName}>{locName}</option>
                            ))}
                          </datalist>
                        </div>

                        <div className="fld" style={{ margin: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <label style={{ margin: 0 }}>Exact Address Line (Revealed to Verified Leads)</label>
                            <button
                              type="button"
                              onClick={() => geocodeAddress(formData.address || formData.loc)}
                              disabled={geocoding}
                              style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                fontSize: 11.5,
                                fontWeight: 600,
                                borderRadius: 6,
                                padding: '2px 8px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              title="Auto-detect GPS pin from this address"
                            >
                              {geocoding ? 'Detecting...' : '📍 Auto-sync GPS'}
                            </button>
                          </div>
                          <input
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            onBlur={() => {
                              if (formData.address) {
                                geocodeAddress(formData.address);
                              }
                            }}
                            placeholder="e.g. Muzhappilangad Drive-In Beach Road"
                            style={{ fontSize: 14 }}
                          />
                        </div>
                      </div>

                      {/* 2-Column: Latitude (GPS) & Longitude (GPS) - PERMANENTLY VISIBLE SPACE */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <div className="fld" style={{ margin: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <label style={{ margin: 0 }}>Latitude (GPS) *</label>
                            <span style={{ fontSize: 11, color: '#64748b' }}>Decimal Degrees (e.g. 11.7944)</span>
                          </div>
                          <input
                            type="number"
                            step="any"
                            required
                            value={formData.lat !== undefined && formData.lat !== null ? formData.lat : ''}
                            onChange={e => setFormData({ ...formData, lat: e.target.value })}
                            placeholder="e.g. 11.8745"
                            style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 14, background: '#fcfdfc' }}
                          />
                        </div>

                        <div className="fld" style={{ margin: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <label style={{ margin: 0 }}>Longitude (GPS) *</label>
                            <span style={{ fontSize: 11, color: '#64748b' }}>Decimal Degrees (e.g. 75.4433)</span>
                          </div>
                          <input
                            type="number"
                            step="any"
                            required
                            value={formData.lng !== undefined && formData.lng !== null ? formData.lng : ''}
                            onChange={e => setFormData({ ...formData, lng: e.target.value })}
                            placeholder="e.g. 75.3704"
                            style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 14, background: '#fcfdfc' }}
                          />
                        </div>
                      </div>

                      {/* Live Google Map Pin Preview */}
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <div>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>Live Google Map Pin Preview</span>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              Current Pin: <b style={{ color: '#0f172a' }}>{Number(activeLat).toFixed(4)}° N, {Number(activeLng).toFixed(4)}° E</b> {formData.loc ? `(${formData.loc})` : ''}
                            </div>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${activeLat},${activeLng}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: 12.5, color: '#0071e3', fontWeight: 600, textDecoration: 'none' }}
                          >
                            Open in Google Maps ↗
                          </a>
                        </div>

                        <div style={{ height: 260, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e2e8f0', background: '#f1f5f9' }}>
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={liveMapUrl}
                            title="Google Maps Location Preview"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: CONTACT & AGENT */}
                  {currentStep === 4 && (
                    <div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f2fe', color: '#0369a1', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <div>
                          <b style={{ color: '#0f172a', fontSize: 14.5 }}>Verified Agent & Inquiries</b>
                          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
                            This agent profile and contact number is shown on the public property page and triggers direct calls and WhatsApp messages.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="fld">
                          <label>Agent / Contact Person Name *</label>
                          <input
                            value={formData.ownerName || ''}
                            onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                            placeholder="e.g. KARMA Official or Agent Name"
                          />
                        </div>

                        <div className="fld">
                          <label>Direct Phone Number * (Call & WhatsApp Target)</label>
                          <input
                            required
                            value={formData.ownerPhone || ''}
                            onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                            placeholder="e.g. +91 99957 97450"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
                        <div className="fld">
                          <label>Contact Email (Optional)</label>
                          <input
                            type="email"
                            value={formData.ownerEmail || ''}
                            onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                            placeholder="e.g. hello@karmarealestate.in"
                          />
                        </div>

                        <div className="fld">
                          <label>RERA Registration Number (Optional)</label>
                          <input
                            value={formData.rera || ''}
                            onChange={e => setFormData({ ...formData, rera: e.target.value })}
                            placeholder="e.g. K-RERA/PRJ/001/2026"
                          />
                        </div>
                      </div>

                      <div className="fld" style={{ marginTop: 8 }}>
                        <label>Internal Confidential Notes (Only visible to Admin Team)</label>
                        <textarea
                          rows="3"
                          className="admin-styled-textarea"
                          style={{ minHeight: 80 }}
                          value={formData.ownerNotes || ''}
                          onChange={e => setFormData({ ...formData, ownerNotes: e.target.value })}
                          placeholder="e.g. Seller is willing to negotiate 5% on immediate cash payment; original title deed verified at Taluk office..."
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 5: SPECS & AMENITIES */}
                  {currentStep === 5 && (
                    <div>
                      <div className="admin-section-card" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                        <div className="admin-section-title">
                          <span>📐 Building & Land Specifications</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                          <div className="fld">
                            <label>Building Area (sq.ft)</label>
                            <input
                              type="number"
                              value={formData.area || ''}
                              onChange={e => setFormData({ ...formData, area: e.target.value })}
                              placeholder="e.g. 2400"
                            />
                          </div>

                          <div className="fld">
                            <label>Land Area (cents)</label>
                            <input
                              type="number"
                              step="any"
                              value={formData.land || ''}
                              onChange={e => setFormData({ ...formData, land: e.target.value })}
                              placeholder="e.g. 10"
                            />
                          </div>

                          <div className="fld">
                            <label>Land Classification</label>
                            <input
                              value={formData.cls || ''}
                              onChange={e => setFormData({ ...formData, cls: e.target.value })}
                              placeholder="e.g. Residential (Dry Land)"
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 4 }}>
                          <div className="fld">
                            <label>Bedrooms (BHK)</label>
                            <input
                              type="number"
                              value={formData.beds || ''}
                              onChange={e => setFormData({ ...formData, beds: e.target.value })}
                              placeholder="e.g. 3"
                            />
                          </div>

                          <div className="fld">
                            <label>Bathrooms</label>
                            <input
                              type="number"
                              value={formData.baths || ''}
                              onChange={e => setFormData({ ...formData, baths: e.target.value })}
                              placeholder="e.g. 3"
                            />
                          </div>

                          <div className="fld">
                            <label>Facing Direction (Optional)</label>
                            <input
                              value={formData.facing || ''}
                              onChange={e => setFormData({ ...formData, facing: e.target.value })}
                              placeholder="e.g. East Facing / 12m Main Road"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Real Video & PDF Brochure Storage Section */}
                      <div className="admin-section-card" style={{ background: '#ffffff', borderColor: '#cbd5e1' }}>
                        <div className="admin-section-title">
                          <span>🎬 Video Walkthrough & 📄 Official PDF Brochure (Storage Disks)</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: '#64748b', marginTop: -6, marginBottom: 14, lineHeight: 1.4 }}>
                          Upload genuine video walkthroughs and PDF brochures stored directly on the server disk. They stream directly on the customer listing page.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          {/* Real Video File Upload Box */}
                          <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                                Real Video File (.mp4, .webm, .mov)
                              </span>
                              <span style={{ fontSize: 11, color: '#64748b' }}>Max 100MB</span>
                            </div>

                            <input
                              type="file"
                              ref={videoInputRef}
                              accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedVideoFile(file);
                              }}
                            />

                            {/* Chosen File State */}
                            {selectedVideoFile ? (
                              <div style={{ padding: '10px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                                  <span style={{ fontSize: 18 }}>🎬</span>
                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedVideoFile.name}</div>
                                    <div style={{ fontSize: 11, color: '#047857' }}>{(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB • Will upload to storage</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { setSelectedVideoFile(null); if (videoInputRef.current) videoInputRef.current.value = ''; }}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, cursor: 'pointer', padding: '4px 6px', fontSize: 14 }}
                                  title="Cancel video selection"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => videoInputRef.current?.click()}
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    border: '1px dashed #94a3b8',
                                    background: '#ffffff',
                                    color: '#0f172a',
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6
                                  }}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                  <span>Upload Video File to Storage</span>
                                </button>

                                {/* Current video in storage if any */}
                                {(formData.videoUrl || (formData.tour && (formData.tour.includes('/storage/') || formData.tour.endsWith('.mp4')))) && (
                                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, background: '#f1f5f9', padding: '6px 10px', borderRadius: 6 }}>
                                    <a
                                      href={formData.videoUrl || formData.tour}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                      ▶ View Stored Video File ↗
                                    </a>
                                    <button
                                      type="button"
                                      onClick={handleRemoveExistingVideo}
                                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            <div style={{ marginTop: 10 }}>
                              <label style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 3 }}>
                                Or External Video / YouTube Link (Fallback)
                              </label>
                              <input
                                value={formData.tour || ''}
                                onChange={e => setFormData({ ...formData, tour: e.target.value })}
                                placeholder="https://youtu.be/... or Matterport"
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 12 }}
                              />
                            </div>
                          </div>

                          {/* Real PDF Brochure Upload Box */}
                          <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M12 18v-6m0 6-2.5-2.5M12 18l2.5-2.5"/></svg>
                                Official Brochure PDF File
                              </span>
                              <span style={{ fontSize: 11, color: '#64748b' }}>Max 30MB</span>
                            </div>

                            <input
                              type="file"
                              ref={brochureInputRef}
                              accept="application/pdf,.pdf"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedBrochureFile(file);
                              }}
                            />

                            {/* Chosen File State */}
                            {selectedBrochureFile ? (
                              <div style={{ padding: '10px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                                  <span style={{ fontSize: 18 }}>📄</span>
                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedBrochureFile.name}</div>
                                    <div style={{ fontSize: 11, color: '#2563eb' }}>{(selectedBrochureFile.size / (1024 * 1024)).toFixed(2)} MB • Will upload to storage</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { setSelectedBrochureFile(null); if (brochureInputRef.current) brochureInputRef.current.value = ''; }}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, cursor: 'pointer', padding: '4px 6px', fontSize: 14 }}
                                  title="Cancel brochure selection"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => brochureInputRef.current?.click()}
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    border: '1px dashed #94a3b8',
                                    background: '#ffffff',
                                    color: '#0f172a',
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6
                                  }}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                  <span>Upload PDF Brochure to Storage</span>
                                </button>

                                {/* Stored Brochure status */}
                                {formData.brochureUrl ? (
                                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, background: '#f1f5f9', padding: '6px 10px', borderRadius: 6 }}>
                                    <a
                                      href={formData.brochureUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                      📄 View Current Stored PDF ↗
                                    </a>
                                    <button
                                      type="button"
                                      onClick={handleRemoveExistingBrochure}
                                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', fontStyle: 'italic', lineHeight: 1.3 }}>
                                    ℹ️ No custom brochure uploaded. System auto-generates branded KARMA A4 PDF summary.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description / Overview */}
                      <div className="admin-section-card" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                        <div className="admin-section-title">
                          <span>📝 Detailed Property Description</span>
                        </div>
                        <textarea
                          rows="4"
                          className="admin-styled-textarea"
                          style={{ minHeight: 100 }}
                          value={formData.desc || ''}
                          onChange={e => setFormData({ ...formData, desc: e.target.value })}
                          placeholder="Describe the architectural highlights, road frontage, water supply, neighborhood, and legal approvals..."
                        />
                      </div>

                      {/* Amenities Grid */}
                      <div className="admin-section-card" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                        <div className="admin-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>🏷️ Select Property Amenities</span>
                          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                            {formData.amenities?.length || 0} selected
                          </span>
                        </div>

                        {/* Custom Amenity Input Field */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                          <input
                            type="text"
                            placeholder="Type custom amenity (e.g. Helipad, Private Garden, Sea View Terrace)..."
                            value={customAmenityInput}
                            onChange={(e) => setCustomAmenityInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomAmenity(e);
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '9px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomAmenity}
                            style={{
                              padding: '9px 18px',
                              background: '#065f46',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            + Add Amenity
                          </button>
                        </div>

                        {/* Custom Added Amenities (if not in preset AMENITIES_LIST) */}
                        {formData.amenities && formData.amenities.some(a => !AMENITIES_LIST.includes(a)) && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#047857', marginBottom: 8 }}>
                              Custom Amenities Added:
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {formData.amenities.filter(a => !AMENITIES_LIST.includes(a)).map((customAmenity, idx) => (
                                <span
                                  key={`custom-${idx}`}
                                  className="admin-item-chip"
                                  style={{
                                    background: '#065f46',
                                    color: '#fff',
                                    borderColor: '#065f46',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    paddingRight: 8
                                  }}
                                >
                                  <span>✓ {customAmenity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAmenity(customAmenity)}
                                    style={{
                                      background: 'rgba(255,255,255,0.2)',
                                      border: 'none',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      padding: '2px 5px',
                                      borderRadius: '50%',
                                      fontSize: 11,
                                      fontWeight: 'bold',
                                      lineHeight: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title={`Remove ${customAmenity}`}
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 8 }}>
                          Preset Amenities:
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {AMENITIES_LIST.map((amenity, idx) => {
                            const isSelected = formData.amenities?.includes(amenity);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleToggleAmenity(amenity)}
                                className="admin-item-chip"
                                style={{
                                  background: isSelected ? '#065f46' : '#fff',
                                  color: isSelected ? '#fff' : '#1e293b',
                                  borderColor: isSelected ? '#065f46' : '#cbd5e1',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s'
                                }}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {amenity}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Bar */}
                <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowModal(false)}
                    style={{
                      padding: '10px 22px',
                      borderRadius: 99,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#334155',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* Always visible Save Changes button */}
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        padding: '10px 20px',
                        borderRadius: 99,
                        border: '1.5px solid #a7f3d0',
                        background: '#f0fdf4',
                        color: '#065f46',
                        fontSize: 13.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s'
                      }}
                      title="Save all changes and close"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          <span>{modalMode === 'add' ? 'Save & Close' : 'Save Changes'}</span>
                        </>
                      )}
                    </button>

                    {currentStep < 5 ? (
                      <button
                        type="button"
                        onClick={() => handleStepSave(currentStep + 1)}
                        disabled={saving}
                        style={{
                          padding: '11px 26px',
                          borderRadius: 99,
                          border: 'none',
                          background: '#065f46',
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: '0 4px 12px rgba(6, 95, 70, 0.25)'
                        }}
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                            </svg>
                            <span>Saving Step...</span>
                          </>
                        ) : (
                          <>
                            <span>Next</span>
                            <span>→</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          padding: '11px 28px',
                          borderRadius: 99,
                          border: 'none',
                          background: '#065f46',
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: '0 4px 12px rgba(6, 95, 70, 0.25)'
                        }}
                      >
                        {saving && (
                          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                          </svg>
                        )}
                        <span>{saving ? 'Saving...' : modalMode === 'add' ? 'Create Listing' : 'Save Changes'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
