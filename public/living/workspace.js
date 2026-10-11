/* Living Campus / a unified scenario workspace over the existing simulation engine. */
(()=>{
const boot=setInterval(()=>{if(!window.campusLab||!window.livingCampus)return;clearInterval(boot);start()},100);
function start(){
const $=id=>document.getElementById(id);
const studies={
 overview:['00','Campus overview','Explore a place built for possibility.','Select a building or follow a delivery across the campus.'],
 event:['01','People & arrivals','Make room for everyone.','Test how visitor demand and admission capacity affect queues.'],
 robots:['02','Autonomous logistics','A campus that keeps moving.','Explore ground deliveries and aerial missions on the same model.'],
 solar:['03','Solar & storage','Keep energy in balance.','Change generation, demand and storage. Watch the power balance respond.'],
 anergy:['04','Shared heating & cooling','One network. Different needs.','Explore KBP-inspired heat exchange between buildings and sources.'],
 heatreuse:['05','Waste-heat recovery','Give surplus heat a purpose.','Connect a hypothetical data centre to campus heating demand.'],
 heat:['06','Shade & comfort','Design a cooler afternoon.','Add trees and a canopy, then inspect shade and surface temperature.'],
 rain:['07','Rain & resilience','Give rainfall somewhere to go.','Compare infiltration, retention and accumulated surface water.']};
const presets={event:[['Conference',{attendance:300,admission:20,closed:false}],['Peak arrival',{attendance:600,admission:10,closed:false}],['Path closure',{attendance:300,admission:20,closed:true}]],robots:[['Ground fleet',{fleet:8,drones:0,closed:false}],['Mixed delivery',{fleet:8,drones:3,closed:false}],['Disrupted route',{fleet:8,drones:3,closed:true}]],solar:[['Clear sky',{cloud:0,capacity:2,demand:1.3,battery:4}],['Cloudy peak',{cloud:95,capacity:2,demand:3,battery:4}],['More storage',{cloud:45,capacity:2,demand:1.3,battery:10}]],anergy:[['Winter',{heating:4,cooling:.3,waste:1,geo:.6,outage:false}],['Summer',{heating:.4,cooling:4,waste:1,geo:.6,outage:false}],['Source outage',{heating:4,cooling:.3,waste:1,geo:.6,outage:true}]],heatreuse:[['Recover heat',{it:1.5,cop:4,load:2,recovery:true}],['Recovery off',{it:1.5,cop:4,load:2,recovery:false}],['High demand',{it:1.5,cop:4,load:4,recovery:true}]],heat:[['Exposed plaza',{trees:0,air:34,hour:14,canopy:false}],['Greener campus',{trees:24,air:34,hour:14,canopy:true}],['Late afternoon',{trees:24,air:34,hour:18,canopy:true}]],rain:[['Summer shower',{rain:20,permeable:35,storage:100}],['Heavy storm',{rain:80,permeable:35,storage:100}],['Retain more',{rain:80,permeable:70,storage:350}]]};
let current='overview',baseline=null;
document.body.classList.add('studio-mode');
if($('studio'))$('studio').id='legacy-studio';
const ui=document.createElement('div');ui.id='campus-studio';ui.innerHTML=`
<aside class="st-rail"><a class="st-brand" href="#">IPAI<span>living systems</span></a><div class="st-rail-label">EXPLORE THE CAMPUS</div><nav class="st-nav" aria-label="Campus use cases">${Object.entries(studies).map(([k,v])=>`<button data-case="${k}"><span>${v[0]}</span>${v[1]}<i>?</i></button>`).join('')}</nav><div class="st-rail-foot"><span class="st-dot"></span> Scenario environment<p>Real geometry.<br>Illustrative operations.</p><button id="st-about">About the models ?</button></div></aside>
<div class="st-header"><div><span id="st-breadcrumb">IPAI / LIVING SYSTEMS</span><h1 id="st-title"></h1></div><div class="st-header-actions"><button id="st-map">Locations ?</button><button id="st-toggle" aria-expanded="true">Controls</button></div></div>
<div class="st-scene-caption"><span id="st-scene-index"></span><h2 id="st-statement"></h2><p id="st-description"></p></div>
<aside class="st-workbench"><div class="st-section-heading"><span id="st-panel-name">CAMPUS EXPLORER</span><span class="st-dot"></span></div><div id="st-presets"></div><div id="st-overview-tools"></div><div id="st-sim-tools"></div></aside>
<section class="st-results"><div class="st-results-heading"><span>SCENARIO RESULTS <small>Illustrative � not live data</small></span><button id="st-capture">Capture baseline</button></div><div id="st-overview-results"></div><div id="st-sim-results"></div><div id="st-comparison" role="status"></div></section>
<div class="st-transport"><div id="st-overview-transport"></div><div id="st-sim-transport"></div></div>
<section class="st-assets"><button id="st-assets-toggle" aria-expanded="false">Objects & activity <span></span></button><div id="st-assets-content" hidden></div></section>`;
document.body.append(ui);
const move=(selector,target)=>{const e=document.querySelector(selector);if(e)$(target).append(e)};
move('.lw-inspector','st-overview-tools');move('.lw-kpis','st-overview-results');move('.lw-view','st-overview-transport');move('.lw-operations','st-assets-content');move('.lw-process','st-assets-content');
move('#sim-panel','st-sim-tools');move('#sim-kpis','st-sim-results');move('.sim-transport','st-sim-transport');
move('.lw-search','st-overview-tools');
const weather=document.createElement('div');weather.className='st-weather';$('st-overview-tools').prepend(weather);weather.append($('lw-weather'),$('lw-night'));
$('st-about').onclick=()=>$('about').showModal();$('st-map').onclick=()=>$('locations-dialog').showModal();
$('st-toggle').onclick=()=>{const closed=ui.classList.toggle('controls-hidden');$('st-toggle').setAttribute('aria-expanded',String(!closed))};
$('st-assets-toggle').onclick=()=>{const open=$('st-assets-content').hidden;$('st-assets-content').hidden=!open;$('st-assets-toggle').setAttribute('aria-expanded',String(open))};
function choose(key){current=key;baseline=null;$('st-comparison').textContent='';ui.dataset.case=key;const d=studies[key];$('st-title').textContent=d[1];$('st-statement').textContent=d[2];$('st-description').textContent=d[3];$('st-scene-index').textContent='FIELD STUDY / '+d[0];$('st-panel-name').textContent=key==='overview'?'CAMPUS EXPLORER':'DESIGN AN EXPERIMENT';
document.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-current',b.dataset.case===key?'page':'false'));
if(key==='overview')livingCampus.enable();else campusLab.openSimulation(key);
$('st-presets').innerHTML=key==='overview'?'':`<span class="st-label">START WITH A SITUATION</span><div class="st-preset-list">${presets[key].map(([name],i)=>`<button data-preset="${i}">${name}<span>?</span></button>`).join('')}</div><span class="st-label">ADJUST THE CONDITIONS</span>`;
$('st-presets').querySelectorAll('button').forEach(b=>b.onclick=()=>{for(const [id,value]of Object.entries(presets[key][+b.dataset.preset][1])){const e=$('sim-input-'+id);if(!e)continue;if(e.type==='checkbox'){e.checked=value;e.dispatchEvent(new Event('change'))}else{e.value=value;e.dispatchEvent(new Event('input'))}}$('sim-reset').click();$('st-presets').querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b))});
const url=new URL(location.href);if(key==='overview')url.searchParams.delete('scenario');else url.searchParams.set('scenario',key);history.replaceState(null,'',url);
}
ui.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>choose(b.dataset.case));ui.querySelector('.st-brand').onclick=e=>{e.preventDefault();choose('overview')};
// Existing object tools and scenario links now stay within this workspace.
document.addEventListener('click',e=>{const b=e.target.closest('[data-study]');if(b)choose(b.dataset.study)});
const values=()=>current==='overview'?Array.from(document.querySelectorAll('.lw-kpis strong')).map(e=>e.textContent):Array.from($('sim-kpis').children).map(e=>e.textContent.trim());
$('st-capture').onclick=()=>{baseline={key:current,values:values(),time:current==='overview'?$('lw-clock').textContent:$('sim-clock').textContent};$('st-comparison').textContent='Baseline at '+baseline.time+' � '+baseline.values.join(' / ');$('st-capture').textContent='Replace baseline'};
window.campusStudio={choose,getState:()=>({current,baseline})};
const initial=campusLab.getSimulationState();choose(initial.active?initial.scenario:'overview');
// Returning from Spaces restores the last scenario and its shell without opening the legacy guide.
document.querySelector('[data-location="campus"]').addEventListener('click',()=>{if(current!=='overview')choose(current)});
}
})();