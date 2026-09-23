/* Read-only Strava import into the personal calendar; excluded from public ranks. */
(() => {
  'use strict';
  const proto=LiftoffApp.prototype,oldInit=proto.init;
  const flights=new WeakMap();
  const account=()=>window.RANKFORGE_ACCOUNT;
  function own(app,id,key){return window.RANKFORGE_APP===app&&app.accountKey===key&&account()?.status?.().signedIn&&account().status().userId===id;}
  function store(app){return app.state.stravaV45||=( {connection:{connected:false},activities:[],lastSyncAt:''} );}
  function validActivities(values){return (Array.isArray(values)?values:[]).filter(item=>item&&/^strava-\d+$/.test(item.id)&&['run','bike','swim'].includes(item.sport)&&Number.isFinite(Date.parse(item.date))&&Number.isFinite(item.durationSeconds)&&item.durationSeconds>0&&Number.isFinite(item.distanceMeters)&&item.distanceMeters>=0).slice(0,500).map(item=>({id:item.id,externalId:String(item.externalId||''),sport:item.sport,date:item.date,durationSeconds:item.durationSeconds,distanceMeters:item.distanceMeters,source:'strava'}));}
  async function request(kind,method='POST'){
    const token=await account()?.getAccessToken?.();
    if(!token)throw new Error('Bitte zuerst mit deinem EvoRank-Konto anmelden.');
    const response=await fetch(`/api/strava/${kind}`,{method,headers:{authorization:`Bearer ${token}`},signal:AbortSignal.timeout(100000)});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'Die Strava-Funktion ist auf dieser Website noch nicht eingerichtet.');return data;
  }
  function show(app,message){app.ui.x45ConnectionMessage=message;if(app.ui.modal?.type==='x45-connections')app.render();}
  async function run(app,kind){
    if(flights.has(app))return flights.get(app);
    const id=account()?.status?.().userId,key=app.accountKey;
    const pending=Promise.resolve().then(async()=>{
      try{
        if(!id||!account().status().signedIn)throw new Error('Bitte zuerst mit deinem EvoRank-Konto anmelden.');
        show(app,kind==='sync'?'Aktivitäten werden geladen …':'Verbindung wird geprüft …');
        const data=await request(kind,kind==='status'?'GET':'POST');
        if(!own(app,id,key))return false;
        const state=store(app);
        if(kind==='connect'){
          const url=new URL(data.authorizationUrl);
          if(url.origin!=='https://www.strava.com'||url.pathname!=='/oauth/authorize')throw new Error('Unbekannte Strava-Anmeldeadresse.');
          location.assign(url.href);return true;
        }
        if(kind==='disconnect'){state.connection={connected:false};state.activities=[];state.lastSyncAt='';}
        if(kind==='status'){state.connection={connected:Boolean(data.connected)};if(!data.connected){state.activities=[];state.lastSyncAt='';}}
        if(kind==='sync'){state.activities=validActivities(data.activities);state.lastSyncAt=data.lastSyncAt||new Date().toISOString();state.connection={connected:true};}
        app.scheduleSave();
        show(app,kind==='sync'?`${state.activities.length} Aktivitäten geladen${data.truncated?' (maximal 500 aus 90 Tagen)':''}.`:kind==='disconnect'?'Strava wurde getrennt.':state.connection.connected?'Strava ist verbunden.':'Noch nicht mit Strava verbunden.');
        if(kind==='sync'&&app.ui.view==='home'&&!app.ui.modal)app.render();
        return true;
      }catch(error){if(own(app,id,key)||!id)show(app,error.message);return false;}
      finally{flights.delete(app);}
    });
    flights.set(app,pending);return pending;
  }
  proto.init=async function(...args){
    const result=await oldInit.apply(this,args);
    const url=new URL(location.href),callback=url.searchParams.get('strava');
    if(callback){
      url.searchParams.delete('strava');history.replaceState(null,'',url.pathname+url.search+url.hash);
      this.openModal('x45-connections');
      if(callback==='connected'&&await run(this,'status'))await run(this,'sync');
      else show(this,callback==='scope-required'?'Bitte den Zugriff auf Aktivitäten bei Strava erlauben.':'Strava-Verbindung abgebrochen.');
    }
    return result;
  };
  async function autoSync(){const app=window.RANKFORGE_APP;if(document.visibilityState==='visible'&&navigator.onLine!==false&&app?.state?.stravaV45?.connection?.connected&&Date.now()-Date.parse(app.state.stravaV45.lastSyncAt||'1970-01-01')>300000)await run(app,'sync');}
  setInterval(autoSync,300000);
  document.addEventListener('visibilitychange',autoSync);
  window.addEventListener('online',autoSync);
  window.EVORANK_STRAVA_X45=Object.freeze({status:app=>run(app,'status'),action:run,validActivities});
})();
