import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AnimatePresence,motion} from 'framer-motion';
import {Upload,FileText,Table2,Play,RefreshCw,CheckCircle2,AlertTriangle,Search,Download,ArrowRight,ShieldCheck} from 'lucide-react';
import './styles.css';

type FilePick={file:File|null};
type Job={job_id:string;status:string;progress:number;message:string;identical_sources?:boolean;analysis_skipped?:boolean;matched?:number;unmatched_a?:number|null;unmatched_b?:number|null;exact_identity?:number;very_high?:number;high?:number;source_a?:{assets:number|null;file:string};source_b?:{assets:number|null;file:string}};
type Match={match_id:string;source_a_asset_id:string;source_b_asset_id:string;source_a_file:string;source_b_file:string;source_a_page?:number;source_a_sheet?:string;source_a_row?:number;source_b_page?:number;source_b_sheet?:string;source_b_row?:number;source_a_field?:string;source_b_field?:string;application_a:string;application_b:string;application_no_equal:boolean;score:number;decision:string;asset_a_url:string;asset_b_url:string;metrics:{phash:number;dhash:number;ahash:number;ssim:number;contour_similarity:number;mask_iou:number;mask_ssim:number;sift_inliers:number}};
type ResultPage={items:Match[];total:number};

const API=(import.meta.env.VITE_API_URL||'http://127.0.0.1:8020').replace(/\/$/,'');
const pct=(x:number)=>`${Math.round(x*100)}%`;

function Drop({label,pick,setPick}:{label:string;pick:FilePick;setPick:(x:FilePick)=>void}){
 const input=useRef<HTMLInputElement>(null);const [over,setOver]=useState(false);
 const accept='.pdf,.xlsx,.xlsm';
 const choose=(f?:File)=>{if(f && ['.pdf','.xlsx','.xlsm'].some(x=>f.name.toLowerCase().endsWith(x)))setPick({file:f})};
 return <motion.div className={`drop ${over?'over':''}`} whileHover={{y:-4}} onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)} onDrop={e=>{e.preventDefault();setOver(false);choose(e.dataTransfer.files[0])}} onClick={()=>input.current?.click()}>
   <input ref={input} type="file" accept={accept} hidden onChange={e=>choose(e.target.files?.[0])}/>
   <div className="dropIcon">{pick.file?.name.endsWith('.pdf')?<FileText/>:<Table2/>}</div>
   <div className="eyebrow">{label}</div>
   <h3>{pick.file?pick.file.name:'Drop PDF / XLSX / XLSM'}</h3>
   <p>{pick.file?`${(pick.file.size/1024/1024).toFixed(2)} MB · ready`: 'Application No. is not required for visual matching.'}</p>
   <button type="button" className="ghost">{pick.file?'Change file':'Choose file'}</button>
 </motion.div>
}

function JusticeArtwork(){
 return <svg viewBox="0 0 360 390" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
   <linearGradient id="justice-gown" x1="132" y1="151" x2="243" y2="334" gradientUnits="userSpaceOnUse"><stop stopColor="#77F4F5" stopOpacity=".9"/><stop offset=".48" stopColor="#168DB4" stopOpacity=".54"/><stop offset="1" stopColor="#0B2638" stopOpacity=".94"/></linearGradient>
   <linearGradient id="justice-gold" x1="222" y1="58" x2="326" y2="151" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF0B3"/><stop offset=".45" stopColor="#FFC66F"/><stop offset="1" stopColor="#D78A3C"/></linearGradient>
   <linearGradient id="justice-sword" x1="115" y1="174" x2="149" y2="298" gradientUnits="userSpaceOnUse"><stop stopColor="#E6FBFF"/><stop offset="1" stopColor="#4ABAD3"/></linearGradient>
   <filter id="justice-glow" x="35" y="12" width="310" height="365" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <circle cx="187" cy="183" r="151" stroke="#38CFE5" strokeOpacity=".12"/>
  <circle cx="187" cy="183" r="127" stroke="#38CFE5" strokeOpacity=".18" strokeDasharray="2 8"/>
  <circle cx="187" cy="183" r="101" stroke="#38CFE5" strokeOpacity=".11"/>
  <g stroke="#35CDE4" strokeOpacity=".31" strokeWidth="1">
   <path d="M33 100h49l21 21h25M49 254h51l22-22h20M251 187h43l21-21h19M243 286h41l20 20h25"/>
   <path d="M72 92v16m0 146v17m234-96v22m-22 89v17"/>
   <path d="M91 83h19m155 220h23m39-149h17"/>
  </g>
  <g fill="#55E7F1">
   <circle cx="33" cy="100" r="3"/><circle cx="128" cy="121" r="2.5"/><circle cx="49" cy="254" r="3"/>
   <circle cx="142" cy="232" r="2.5"/><circle cx="334" cy="166" r="3"/><circle cx="329" cy="306" r="3"/>
  </g>
  <g filter="url(#justice-glow)" opacity=".35" stroke="#36D8EC" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
   <path d="M166 142 147 177 151 210 132 293 112 325h143l-20-36-21-87-10-49"/>
  </g>
  <path d="M164 139c-13 8-21 21-23 37l10 32-19 85-20 32h143l-20-35-21-83-8-47c-4-16-17-26-34-30l-8 9Z" fill="url(#justice-gown)" stroke="#5DE2ED" strokeOpacity=".82" strokeWidth="1.6"/>
  <path d="M161 150c-8 32-8 68-10 102m26-104c13 39 15 76 25 116m-61 21h81m-98 23h123" stroke="#8CF4F3" strokeOpacity=".4" strokeWidth="1.2"/>
  <path d="M148 184c-4 15-7 28-3 40l-9 33m68-73 13 42 7 28" stroke="#A4FAF7" strokeOpacity=".36" strokeWidth="1.1"/>
  <path d="M163 105c0-17 10-30 25-31 15-1 26 10 26 26l-4 20-15 16-19-5-11-14-2-12Z" fill="#D59A77" stroke="#FFE0BD" strokeOpacity=".74" strokeWidth="1.4"/>
  <path d="M163 107c-5-19 4-37 19-42 18-6 34 5 36 23l-7 7-9-10-12 7-24 3-3 12Z" fill="#163548" stroke="#58DDEB" strokeWidth="1.5"/>
  <path d="m164 100 47-5 5 9-48 7-4-11Z" fill="#44D6E4" fillOpacity=".9" stroke="#B5FBF8" strokeWidth="1"/>
  <path d="m174 118 14 1m-8 12 12 4" stroke="#744C43" strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="m166 139-19 13-19 29m63-37 20-15 20-23 13-19" stroke="#7FEAF0" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="m166 139-19 13-19 29m63-37 20-15 20-23 13-19" stroke="#B7FBF8" strokeOpacity=".7" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="m250 86 13-12 9 10-13 12" fill="#E9B47B" stroke="#FFE2A0" strokeWidth="1.2"/>
  <g stroke="url(#justice-gold)" strokeLinecap="round" strokeLinejoin="round">
   <path d="m269 79 49-5" strokeWidth="4"/>
   <path d="m292 77-5 50m-22-47-12 49m61-53 10 52" strokeWidth="1.7"/>
   <path d="M250 127q23 26 48 0m13 1q18 20 37 0" strokeWidth="2.4"/>
   <path d="M277 91h29M264 93h14" strokeWidth="1" strokeOpacity=".75"/>
  </g>
  <path d="M130 184 112 173l-7 9 20 18m-8-17-5 17m13-10-18-10" stroke="url(#justice-sword)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="m117 196-20 105m-6-5 14 3m-17 8 18 3m-21 8 18 3" stroke="url(#justice-sword)" strokeWidth="2.2" strokeLinecap="round"/>
  <path d="M178 347h20m-32 9h44m-55 8h66" stroke="#42D8E8" strokeOpacity=".56" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M181 350 164 365m31-15 16 15" stroke="#42D8E8" strokeOpacity=".38"/>
  <g fill="#FFCC7C">
   <circle cx="318" cy="74" r="3.2"/><circle cx="250" cy="127" r="2.5"/><circle cx="324" cy="128" r="2.5"/>
  </g>
  <text x="180" y="382" fill="#82A8B8" fontFamily="Space Mono, monospace" fontSize="8" letterSpacing="2.3" textAnchor="middle">JUSTICE // VISUAL EVIDENCE</text>
 </svg>
}

function Metric({name,value}:{name:string;value:number}){return <div className="metric"><span>{name}</span><b>{pct(value)}</b><div className="bar"><i style={{width:`${Math.max(0,Math.min(1,value))*100}%`}}/></div></div>}

function App(){
 const [a,setA]=useState<FilePick>({file:null}),[b,setB]=useState<FilePick>({file:null}),[job,setJob]=useState<Job|null>(null),[results,setResults]=useState<Match[]>([]),[resultCount,setResultCount]=useState(0),[filter,setFilter]=useState('ALL'),[query,setQuery]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState(''),[resultsLoading,setResultsLoading]=useState(false),[resultsError,setResultsError]=useState(''),[page,setPage]=useState(1);
 const run=async()=>{
  if(!a.file||!b.file)return;
  setLoading(true);setError('');setResults([]);
  try{
   const fd=new FormData();fd.append('file_a',a.file);fd.append('file_b',b.file);
   const response=await fetch(`${API}/api/analyze`,{method:'POST',body:fd});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.detail||`Upload failed (${response.status}).`);
   if(!data.job_id)throw new Error('The server did not return an analysis job ID.');
   setJob(data);
  }catch(requestError){
   setError(requestError instanceof Error?requestError.message:'Analysis could not be started.');
   setLoading(false);
  }
 };
 useEffect(()=>{if(!job?.job_id||job.status==='completed'||job.status==='error')return;const t=setInterval(async()=>{const r=await fetch(`${API}/api/jobs/${job.job_id}`);const state=await r.json().catch(()=>({}));if(!r.ok){setJob(current=>current?.job_id===job.job_id?{...current,status:'error',message:state.detail||'The analysis job is no longer available. Start a new analysis.'}:current);return}setJob({...state,job_id:job.job_id})},1000);return()=>clearInterval(t)},[job?.job_id,job?.status]);
 useEffect(()=>{if(job?.status==='completed'||job?.status==='error')setLoading(false)},[job?.status]);
 useEffect(()=>{
  if(job?.status!=='completed')return;
  const controller=new AbortController();
  const timer=window.setTimeout(async()=>{
   setResultsLoading(true);setResultsError('');
   const params=new URLSearchParams({offset:String((page-1)*100),limit:'100'});
   if(query.trim())params.set('q',query.trim());
   const decisions:Record<string,string>={EXACT:'EXACT_VISUAL_IDENTITY',VERY_HIGH:'VERY_HIGH_VISUAL_SIMILARITY',HIGH:'HIGH_VISUAL_SIMILARITY'};
   if(decisions[filter])params.set('decision',decisions[filter]);
   try{
    const response=await fetch(`${API}/api/jobs/${job.job_id}/results?${params}`,{signal:controller.signal});
    const data=await response.json();
    if(!response.ok)throw new Error(data.detail||'Unable to load search results.');
    const resultPage=data as ResultPage;
    setResults(resultPage.items);setResultCount(resultPage.total);
   }catch(requestError){
    if(!controller.signal.aborted)setResultsError(requestError instanceof Error?requestError.message:'Unable to load search results.');
   }finally{
    if(!controller.signal.aborted)setResultsLoading(false);
   }
  },200);
  return()=>{window.clearTimeout(timer);controller.abort()};
 },[job?.job_id,job?.status,page,filter,query]);
 const pageCount=Math.max(1,Math.ceil(resultCount/100));

 return <div className="app">
  <div className="noise"/><header><div className="brand"><div className="brandMark">A</div><div><strong>APEXIVE AI</strong><span>TRADEMARK VISUAL CONFLICT</span></div></div><div className="headerPill"><ShieldCheck size={15}/> VISUAL EVIDENCE ENGINE v4</div></header>
  <main>
   <section className="hero"><div><div className="eyebrow">GLOBAL LOGO COMPARISON</div><h1>Find visual conflicts.<br/><em>Without relying on Application No.</em></h1><p>PDF sources use the logo in field (540); XLSX/XLSM sources use images in the Mark column. The engine compares those marks visually using multi-stage fingerprinting and structural verification.</p></div><div className="heroJustice" role="img" aria-label="Illustration of blindfolded Lady Justice holding golden scales and a sword, surrounded by a digital network"><JusticeArtwork/></div></section>
   <section className="uploadGrid"><Drop label="SOURCE A" pick={a} setPick={setA}/><div className="versus"><span>VS</span><ArrowRight/></div><Drop label="SOURCE B" pick={b} setPick={setB}/></section>
   <div className="action"><button className="run" disabled={!a.file||!b.file||loading} onClick={run}><Play size={18} fill="currentColor"/>{loading?'ANALYSIS RUNNING':'RUN VISUAL COMPARISON'}</button>{job&&<button className="reset" onClick={()=>{setJob(null);setResults([]);setA({file:null});setB({file:null});setError('')}}><RefreshCw size={16}/> New analysis</button>}</div>
   {error&&<div className="request-error" role="alert"><AlertTriangle size={16}/>{error}</div>}
   {job&&<section className="progressCard"><div className="progressTop"><span>{job.message||job.status}</span><b>{job.progress||0}%</b></div><div className="progress"><i style={{width:`${job.progress||0}%`}}/></div>{job.status==='error'?<div className="error"><AlertTriangle size={16}/>{job.message}</div>:<div className="tiny">{job.analysis_skipped?job.message:'Application-number equality is metadata only · visual matching remains independent.'}</div>}</section>}
   {job?.status==='completed'&&<>
    <section className="stats"><Stat title="SOURCE A" value={job.source_a?.assets??0}/><Stat title="SOURCE B" value={job.source_b?.assets??0}/><Stat title="MATCHED LOGOS" value={job.matched??0} accent/><Stat title="EXACT" value={job.exact_identity??0}/><Stat title="UNMATCHED A" value={job.unmatched_a??0}/><Stat title="UNMATCHED B" value={job.unmatched_b??0}/></section>
    <section className="resultsHead"><div><div className="eyebrow">MATCH RESULTS</div><h2>{resultCount.toLocaleString()} visual matches</h2></div><div className="tools"><div className="search"><Search size={16}/><input aria-label="Search results" placeholder="ᴛʏᴘᴇ ꜱᴏᴍᴇᴛʜɪɴɢ ᴛᴏ ꜱᴛᴀʀᴛ" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></div><div className="filters">{['ALL','EXACT','VERY_HIGH','HIGH'].map(x=><button key={x} className={filter===x?'active':''} onClick={()=>{setFilter(x);setPage(1)}}>{x.replace('_',' ')}</button>)}</div><a className="download" href={`${API}/api/jobs/${job.job_id}/files/matches.csv`}><Download size={15}/> CSV</a></div></section>
    {resultsError&&<div className="error"><AlertTriangle size={16}/>{resultsError}</div>}
    {resultsLoading&&<div className="tiny">Searching all matching logos…</div>}
    {!resultsLoading&&!resultsError&&resultCount===0&&<div className="tiny">No matching logos found. Try another application number or search term.</div>}
    <div className="matchList">{results.map((m,i)=><MatchCard key={m.match_id} m={m} i={i}/>)}</div><div className="pager"><button disabled={page<=1||resultsLoading} onClick={()=>setPage(p=>p-1)}>← Previous</button><span>Page {page} / {pageCount} · {resultCount.toLocaleString()} results</span><button disabled={page>=pageCount||resultsLoading} onClick={()=>setPage(p=>p+1)}>Next →</button></div>
   </>}
  </main>
  <footer>Apexive AI · Technical visual evidence only · Application No. does not gate logo matching</footer>
 </div>
}
function Stat({title,value,accent=false}:{title:string;value:number|string;accent?:boolean}){return <div className={`stat ${accent?'accent':''}`}><span>{title}</span><strong>{typeof value==='number'?value.toLocaleString():value}</strong></div>}
function MatchCard({m,i}:{m:Match;i:number}){return <motion.article className="match" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*.015,.25)}}>
 <div className="matchId"><span>{m.match_id}</span><b>{m.decision.replaceAll('_',' ')}</b></div>
 <div className="visualPair"><div className="asset"><span>SOURCE A</span><img src={`${API}${m.asset_a_url}`}/><small>{m.source_a_file}{m.source_a_page?` · page ${m.source_a_page}`:m.source_a_sheet?` · ${m.source_a_sheet} / row ${m.source_a_row}`:''}{m.source_a_field?` · ${m.source_a_field}`:''}</small></div><div className="linkLine"><div>↔</div><strong>{pct(m.score)}</strong></div><div className="asset"><span>SOURCE B</span><img src={`${API}${m.asset_b_url}`}/><small>{m.source_b_file}{m.source_b_page?` · page ${m.source_b_page}`:m.source_b_sheet?` · ${m.source_b_sheet} / row ${m.source_b_row}`:''}{m.source_b_field?` · ${m.source_b_field}`:''}</small></div></div>
 <div className="meta"><div><span>Application A</span><b>{m.application_a||'—'}</b></div><div><span>Application B</span><b>{m.application_b||'—'}</b></div><div><span>App No. equal</span><b>{m.application_no_equal?'YES':'NO — STILL MATCHED'}</b></div></div>
 <div className="metrics"><Metric name="pHash" value={m.metrics.phash}/><Metric name="dHash" value={m.metrics.dhash}/><Metric name="SSIM" value={m.metrics.ssim}/><Metric name="Contour" value={m.metrics.contour_similarity}/><Metric name="Mask IoU" value={m.metrics.mask_iou}/><Metric name="Mask SSIM" value={m.metrics.mask_ssim}/><div className="sift"><span>SIFT inliers</span><b>{m.metrics.sift_inliers}</b></div></div>
 </motion.article>}
createRoot(document.getElementById('root')!).render(<App/>);
