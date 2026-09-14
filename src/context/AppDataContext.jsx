import { createContext, useState } from 'react';

const IMG = {
  flat1:[
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
    'https://images.unsplash.com/photo-1502672260266-1c1e506d2105',
    'https://images.unsplash.com/photo-1560448204-61dc36dc98c8',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858'
  ],
  land1:[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
    'https://images.unsplash.com/photo-1416331108676-a22ccb276e35',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b',
    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e',
    'https://images.unsplash.com/photo-1590074061805-728b7eec9f6a'
  ],
  villa:[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
  ],
  commercial:[
    'https://images.unsplash.com/photo-1497366216548-37526070297c',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    'https://images.unsplash.com/photo-1531973576160-7125cd663d86',
    'https://images.unsplash.com/photo-1416949929422-a1d9c20d4db1'
  ]
};

export const LOCALITIES = [
  {n:'Kannur City', d:'Fort Road & town centre'},
  {n:'Thottada', d:'Beachside, 8 km south'},
];

const INITIAL_PROPS = [
 {id:1,title:'2BHK Flat near Thottada Beach',type:'Flat',purpose:'Sale',price:48,unit:'',loc:'Thottada',imgs:IMG.flat1,beds:2,baths:2,area:'1,080 sq.ft',land:null,listed:'2026-07-12',status:'Available',pub:true,views:64,leads:5,nego:true,lat:11.8347,lng:75.4093,featured:true,rera:'K-RERA/PRJ/KNR/047/2025',cls:'',pros:['400 m walk to Thottada beach'],cons:['Lift serves only up to 3rd floor'],desc:'A neatly kept 2BHK on the second floor...', tour: null},
 {id:2,title:'12 Cents Residential Plot, Thottada',type:'Land',purpose:'Sale',price:66,unit:'',loc:'Thottada',imgs:IMG.land1,beds:null,baths:null,area:null,land:'12 cents',listed:'2026-07-15',status:'Available',pub:true,views:41,leads:4,nego:true,lat:11.8380,lng:75.4050,featured:true,rera:null,cls:'Purayidam',pros:['Clear single-owner title'],cons:['Boundary wall not yet built'],desc:'A ready-to-build 12 cent plot...', tour: null},
 {id:3,title:'4BHK Luxury Villa with Garden',type:'House',purpose:'Sale',price:120,unit:'',loc:'Kannur City',imgs:IMG.villa,beds:4,baths:4,area:'2,400 sq.ft',land:'8 cents',listed:'2026-07-18',status:'Available',pub:true,views:128,leads:12,nego:false,lat:11.8745,lng:75.3704,featured:true,rera:'K-RERA/PRJ/KNR/012/2024',cls:'',pros:['Premium finishing', 'Quiet neighborhood'],cons:['Requires own borewell maintenance'],desc:'A beautiful newly built villa in the heart of the city...', tour: 'https://www.youtube.com/embed/M7lc1UVf-VE'},
 {id:4,title:'Commercial Office Space',type:'Commercial',purpose:'Rent',price:1.2,unit:'L/mo',loc:'Kannur City',imgs:IMG.commercial,beds:null,baths:null,area:'1,500 sq.ft',land:null,listed:'2026-07-20',status:'Available',pub:true,views:95,leads:8,nego:true,lat:11.8780,lng:75.3650,featured:true,rera:null,cls:'',pros:['Main road frontage', 'Ample parking'],cons:['First floor only'],desc:'Spacious commercial setup perfect for IT or consulting...', tour: null},
];

const INITIAL_LEADS = [
 {id:1,name:'Anjali Menon',phone:'98460 12345',loc:'Thottada',first:'17 Jul 2026',status:'New',src:'OTP unlock',props:['2BHK Flat near Thottada Beach'],log:[{t:'Unlocked 12 Cents Residential Plot',w:'17 Jul, 6:42 pm'}]},
 {id:2,name:'Sreejith Kumar',phone:'94470 88221',loc:'Kannur City',first:'17 Jul 2026',status:'New',src:'Site visit request',props:['4BHK Villa with Garden'],log:[{t:'Requested site visit — Sun 20 Jul, Morning',w:'17 Jul, 2:10 pm'}]}
];

const INITIAL_DOCS = {
 1:[{n:'Title Deed — Thottada Flat.pdf',s:'2.4 MB',k:'pdf'}]
};

const INITIAL_REMARKS = {
 1:'Owner open to ~5% negotiation if registration completed before September.'
};

const INITIAL_ACCESS_LOG = [
 {w:'17 Jul, 5:12 pm',t:'Viewed "Title Deed — 12 Cents Thottada.pdf"'}
];

export const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const [props, setProps] = useState(INITIAL_PROPS);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [remarks, setRemarks] = useState(INITIAL_REMARKS);
  const [accessLog, setAccessLog] = useState(INITIAL_ACCESS_LOG);
  
  const [wishlist, setWishlist] = useState([]); // array of property IDs
  const [user, setUser] = useState(null); // { name, phone, loc } if verified
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const addLead = (lead) => {
    setLeads(prev => [{ ...lead, id: Date.now(), status: 'New', first: new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}), log: [{t: lead.src || 'New Lead', w: new Date().toLocaleString('en-GB', {day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true})}] }, ...prev]);
  };

  const addProperty = (prop) => {
    setProps(prev => [{ ...prop, id: Date.now(), listed: new Date().toISOString().split('T')[0], status: 'Available', pub: true, views: 0, leads: 0 }, ...prev]);
  };

  return (
    <AppDataContext.Provider value={{
      props, setProps, addProperty,
      leads, setLeads, addLead,
      docs, setDocs,
      remarks, setRemarks,
      accessLog, setAccessLog,
      wishlist, toggleWishlist,
      user, setUser,
      showAuthModal, setShowAuthModal
    }}>
      {children}
    </AppDataContext.Provider>
  );
}
