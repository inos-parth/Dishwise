"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[144],{144:(e,n,s)=>{s.r(n),s.d(n,{default:()=>r});var a=s(43),i=s(134);var t=s(579);const o=e=>{var n;let{restaurant:s}=e;const[o,r]=(0,a.useState)(!1),[l,c]=(0,a.useState)(null),[d,u]=(0,a.useState)(!1),h=(0,i.Zp)();return(0,t.jsxs)("div",{className:"restaurant-card",children:[(null===(n=s.photos)||void 0===n?void 0:n[0])&&(0,t.jsx)("img",{src:s.photos[0].getUrl(),alt:s.name,className:"restaurant-image"}),(0,t.jsxs)("div",{className:"restaurant-info",children:[(0,t.jsx)("h3",{children:s.name}),(0,t.jsx)("p",{children:s.vicinity}),(0,t.jsxs)("div",{className:"restaurant-details",children:[(0,t.jsx)("span",{className:"rating",children:s.rating?`${s.rating} \u2b50`:"No rating"}),s.price_level&&(0,t.jsx)("span",{className:"price-level",children:"$".repeat(s.price_level)})]}),s.opening_hours&&(0,t.jsx)("p",{className:"status "+(s.opening_hours.isOpen?s.opening_hours.isOpen()?"open":"closed":"unknown"),children:s.opening_hours.isOpen?s.opening_hours.isOpen()?"Open Now":"Closed":"No Opening Information"}),(0,t.jsx)("button",{className:"view-menu-button",onClick:()=>{h(`/restaurant/${s.place_id}/menu`)},children:"View Menu"}),o&&l&&(0,t.jsx)("div",{className:"menu-modal",children:(0,t.jsxs)("div",{className:"menu-content",children:[(0,t.jsxs)("h4",{children:[s.name," - Menu"]}),(0,t.jsx)("button",{className:"close-menu",onClick:()=>r(!1),children:"\xd7"}),(0,t.jsx)("div",{className:"menu-items",children:l.map(((e,n)=>(0,t.jsxs)("div",{className:"menu-item",children:[(0,t.jsx)("span",{className:"item-name",children:e.name}),(0,t.jsxs)("span",{className:"item-price",children:["$",e.price]})]},n)))})]})})]})]})},r=()=>{var e;const n=(0,i.zy)(),s=(0,i.Zp)(),r=null===(e=n.state)||void 0===e?void 0:e.searchLocation,{restaurants:l,loading:c,error:d,initMap:u}=(e=>{const[n,s]=(0,a.useState)([]),[i,t]=(0,a.useState)(!0),[o,r]=(0,a.useState)(null),l=(0,a.useRef)([]),c=(0,a.useRef)(null),d=()=>{l.current&&(l.current.forEach((e=>e.setMap(null))),l.current=[])},u=(0,a.useCallback)((async function(){let n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(!window.google)throw new Error("Google Maps not loaded");try{var a,i;if(d(),null===e||void 0===e||null===(a=e.coordinates)||void 0===a||!a.lat||null===e||void 0===e||null===(i=e.coordinates)||void 0===i||!i.lng)throw new Error("Invalid location coordinates");const o=new window.google.maps.LatLng(e.coordinates.lat,e.coordinates.lng);c.current=new window.google.maps.Map(document.getElementById("map"),{center:o,zoom:14,mapId:"3d323ae4d3f413fd"});const r=new window.google.maps.places.PlacesService(c.current),u={location:o,keyword:`food ${n.cuisine||""}`.trim(),rankBy:window.google.maps.places.RankBy.DISTANCE};n.openNow&&(u.openNow=!0);const h=await new Promise(((e,n)=>{r.nearbySearch(u,((s,a)=>{a===window.google.maps.places.PlacesServiceStatus.OK?e(s):n(new Error(`Places API error: ${a}`))}))})),p=n.minRating?h.filter((e=>e.rating>=n.minRating)):h,m=n.minRating?p.sort(((e,n)=>n.rating-e.rating)):p;m.forEach((e=>{var n;if(null!==(n=e.geometry)&&void 0!==n&&n.location){const n=new window.google.maps.Marker({position:e.geometry.location,map:c.current,title:e.name}),s=new window.google.maps.InfoWindow({content:`\n                            <div>\n                                <h3>${e.name}</h3>\n                                <p>${e.vicinity}</p>\n                                <p>${e.rating?`${e.rating} \u2b50`:"No rating"}</p>\n                            </div>\n                        `});n.addListener("click",(()=>{s.open(c.current,n)})),l.current.push(n)}})),s(m),t(!1)}catch(o){throw r(o.message),t(!1),o}}),[e]);return(0,a.useEffect)((()=>()=>{d()}),[]),{restaurants:n,loading:i,error:o,initMap:u}})(r),[h,p]=(0,a.useState)(!0),m=()=>{p((e=>!e))},[g,v]=(0,a.useState)({cuisine:"",openNow:!1,priceLevel:null});(0,a.useEffect)((()=>{if(!r)return void s("/");let e;let n=0;const a=async()=>{try{await u(g)}catch(s){n<5?(n++,e=setTimeout(a,1e3)):console.error("Failed to load map after retries:",s)}};return a(),()=>{e&&clearTimeout(e)}}),[r,s,u,g]);const w=e=>{const{name:n,value:s,type:a,checked:i}=e.target;v((e=>({...e,[n]:"minRating"===n&&""!==s?parseFloat(s):"checkbox"===a?i:s})))};return(0,a.useEffect)((()=>{!c&&!d&&l.length>0&&(async e=>{try{const n=await fetch("http://localhost:8000/api/restaurants/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({restaurants:e})}),s=await n.json();if(!n.ok)throw console.error("Error response from server:",s),new Error(s.message||"Failed to save restaurants to the database");console.log("Restaurants saved successfully:",s)}catch(n){console.error("Error saving restaurants:",n.message)}})(l)}),[c,d,l]),(0,t.jsxs)("div",{className:"results-page",children:[(0,t.jsxs)("div",{className:"results-header",children:[(0,t.jsxs)("button",{onClick:()=>s("/"),className:"back-button",children:[(0,t.jsx)("i",{className:"fas fa-arrow-left"})," Back to Search"]}),(0,t.jsxs)("h1",{children:["Restaurants near ",(null===r||void 0===r?void 0:r.address)||"the selected location"]})]}),(0,t.jsxs)("div",{className:"filters-container",children:[(0,t.jsxs)("select",{name:"cuisine",value:g.cuisine,onChange:w,children:[(0,t.jsx)("option",{value:"",children:"All Cuisines"}),(0,t.jsx)("option",{value:"italian",children:"Italian"}),(0,t.jsx)("option",{value:"indian",children:"Indian"}),(0,t.jsx)("option",{value:"chinese",children:"Chinese"}),(0,t.jsx)("option",{value:"pizza",children:"Pizza"})]}),(0,t.jsxs)("label",{children:[(0,t.jsx)("input",{type:"checkbox",name:"openNow",checked:g.openNow,onChange:w}),"Open Now"]}),(0,t.jsxs)("select",{name:"minRating",value:g.minRating||"",onChange:w,children:[(0,t.jsx)("option",{value:"",children:"All Ratings"}),(0,t.jsx)("option",{value:"3",children:"3 \u2b50"}),(0,t.jsx)("option",{value:"4",children:"4 \u2b50"}),(0,t.jsx)("option",{value:"5",children:"5 \u2b50"})]})]}),(0,t.jsxs)("div",{className:"results-container",children:[h&&(0,t.jsx)("div",{id:"map",className:"map-container",children:(0,t.jsx)("div",{className:"dropdown",children:(0,t.jsxs)("select",{onChange:m,className:"dropdown-toggle",children:[(0,t.jsx)("option",{value:"show",children:"Hide Map"}),(0,t.jsx)("option",{value:"hide",children:"Show Map"})]})})}),!h&&(0,t.jsx)("div",{className:"dropdown",children:(0,t.jsx)("select",{onChange:m,className:"dropdown-toggle",children:(0,t.jsx)("option",{value:"show",children:"Show Map"})})}),(0,t.jsxs)("div",{className:"restaurants-list",children:[c&&(0,t.jsx)("div",{className:"loading",children:"Searching for restaurants..."}),d&&(0,t.jsx)("div",{className:"error-message",children:d}),!c&&!d&&l.map((e=>(0,t.jsx)(o,{restaurant:e},e.place_id)))]})]})]})}}}]);
//# sourceMappingURL=144.45f6b061.chunk.js.map