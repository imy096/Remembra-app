/* Remembra local language, date and search helpers. No network requests. */
(()=>{'use strict';
const translitDigits=s=>String(s||'').replace(/[٠-٩۰-۹]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)>=0?'٠١٢٣٤٥٦٧٨٩'.indexOf(c):'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
function norm(s){return translitDigits(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
const months={january:0,jan:0,janvier:0,يناير:0,february:1,feb:1,fevrier:1,فبراير:1,march:2,mar:2,mars:2,مارس:2,april:3,apr:3,avril:3,ابريل:3,may:4,mai:4,مايو:4,june:5,jun:5,juin:5,يونيو:5,july:6,jul:6,juillet:6,يوليو:6,august:7,aug:7,aout:7,اغسطس:7,september:8,sept:8,septembre:8,سبتمبر:8,october:9,oct:9,octobre:9,اكتوبر:9,november:10,nov:10,novembre:10,نوفمبر:10,december:11,dec:11,decembre:11,ديسمبر:11};
const weekdays={sunday:0,dimanche:0,الاحد:0,monday:1,lundi:1,الاثنين:1,tuesday:2,mardi:2,الثلاثاء:2,wednesday:3,mercredi:3,الاربعاء:3,thursday:4,jeudi:4,الخميس:4,friday:5,vendredi:5,الجمعه:5,saturday:6,samedi:6,السبت:6};
const spokenHours={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,واحد:1,واحده:1,الواحده:1,الثانيه:2,اثنين:2,ثلاثه:3,الثالثه:3,اربعه:4,الرابعه:4,خمسه:5,الخامسه:5,سته:6,ست:6,السادسه:6,سبعه:7,السابعه:7,ثمانيه:8,الثامنه:8,تسعه:9,التاسعه:9,عشره:10,العاشره:10,الحاديه:11,الحادي:11,الثانيه:2,الثاني:2};
function parseWhen(input,now=new Date()){
 const text=translitDigits(input),n=norm(text),d=new Date(now.getFullYear(),now.getMonth(),now.getDate()),today=new Date(d),iso=text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/),eu=text.match(/\b(\d{1,2})[/.](\d{1,2})[/.](20\d{2})\b/);
 let hasDate=false,invalid=false,explicitYear=false;
 if(iso||eu){const y=+(iso?iso[1]:eu[3]),mo=+(iso?iso[2]:eu[2])-1,day=+(iso?iso[3]:eu[1]);d.setFullYear(y,mo,day);hasDate=true;explicitYear=true;invalid=d.getFullYear()!==y||d.getMonth()!==mo||d.getDate()!==day}
 else {
  const m=n.match(/\b(\d{1,2})(?:st|nd|rd|th|er)?\s+(?:of\s+|de\s+)?([\p{L}]+)(?:\s+(20\d{2}))?\b/u)||n.match(/\b([\p{L}]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(20\d{2}))?\b/u);
  if(m){let day,mo,y;if(/^\d/.test(m[1])){day=+m[1];mo=months[m[2]];y=m[3]?+m[3]:now.getFullYear()}else{day=+m[2];mo=months[m[1]];y=m[3]?+m[3]:now.getFullYear()}if(mo!==undefined){d.setFullYear(y,mo,day);hasDate=true;explicitYear=!!m[3];invalid=d.getFullYear()!==y||d.getMonth()!==mo||d.getDate()!==day;if(!invalid&&!explicitYear&&d<today)d.setFullYear(y+1)}}
  if(!hasDate){if(/\b(day after tomorrow|apres demain)\b|بعد غد|بعد بكرا/.test(n)){d.setDate(d.getDate()+2);hasDate=true}else if(/\b(tomorrow|demain)\b|غدا|بكره|بكرا/.test(n)){d.setDate(d.getDate()+1);hasDate=true}else if(/\b(today|aujourd hui)\b|اليوم/.test(n)){hasDate=true}else {for(const [word,day] of Object.entries(weekdays))if(new RegExp('(?:^| )'+word+'(?: |$)','u').test(n)){let diff=(day-d.getDay()+7)%7;if(diff===0||new RegExp('(?:next|prochain|القادم) '+word+'(?: |$)','u').test(n))diff=diff||7;d.setDate(d.getDate()+diff);hasDate=true;break}}}
 }
 let clock=text.match(/(?:^|[\s(])(?:at|à|a|vers|around|الساعة|عند)\s*(\d{1,2})(?:[:h.](\d{1,2}))?\s*(a\.?m\.?|p\.?m\.?|morning|afternoon|evening|صباحا|صباح|مساء|ليلا)?/i);
 if(!clock)clock=text.match(/(?:^|\s)(\d{1,2})[:h](\d{2})\s*(a\.?m\.?|p\.?m\.?|morning|afternoon|evening|صباحا|صباح|مساء|ليلا)?/i);
 if(!clock){const short=text.match(/(?:^|\s)(\d{1,2})\s*(a\.?m\.?|p\.?m\.?|morning|afternoon|evening|صباحا|صباح|مساء|ليلا)(?:\b|$)/i);if(short)clock=[short[0],short[1],undefined,short[2]]}
 if(!clock){const w=n.match(/(?:^| )(?:الساعه|at|a|vers|around)\s+([\p{L}]+)(?:\s+(صباحا|صباح|مساء|مساءا|ليلا|am|pm|morning|afternoon|evening))?/u);if(w&&spokenHours[w[1]])clock=[w[0],String(spokenHours[w[1]]),undefined,w[2]]}
 let hasTime=!!clock,ambiguous=false,hour=0,minute=0;
 if(clock){hour=+clock[1];minute=+(clock[2]||0);const marker=norm(clock[3]||'');const pm=/^p m$|^pm$|afternoon|evening|مساء|ليلا/.test(marker),am=/^a m$|^am$|morning|صباح/.test(marker);if(hour>23||minute>59||(pm||am)&&hour>12)invalid=true;else if(pm&&hour<12)hour+=12;else if(am&&hour===12)hour=0;else if(!pm&&!am&&hour>0&&hour<=12&&!((/[:h]\d{2}|\d{1,2}h/i.test(clock[0]))&&!/(?:\bat\b|\baround\b|الساعة)/i.test(clock[0])))ambiguous=true;d.setHours(hour,minute,0,0)}
 return {status:invalid?'invalid':!hasDate?'missing-date':!hasTime?'missing-time':ambiguous?'ambiguous-time':'complete',dateAt:hasDate&&hasTime&&!invalid&&!ambiguous?d.toISOString():'',hasDate,hasTime,ambiguous};
}
const stop=new Set('where what when how why who did do does i you my me is are was were the a an this that it for in on at to of about tell find show please help forgot forgotten forget remember misplaced lost de du des le la les un une ai je dans ou est que quoi qui mon ma mes en et ce cette ces il elle comment retrouver chercher dire trouve trouver aide aider oublie oubliee perdu perdue quel quelle quand في اين فين وين متى من ماذا وضعت عندي لدي هل هو هي ما كيف عن ابحث ارني لي ليه ساعدني ساعد لقد نسيت نسيتني نسيته نسيتهما تذكرت اذكر تذكر اينما'.split(' '));
const groups=[['key','keys','cle','cles','مفتاح','مفاتيح'],['wallet','portefeuille','محفظه','محفظة'],['glasses','lunettes','نظاره','نظارة','نظارات'],['phone','telephone','téléphone','هاتف','تليفون','تلفون','جوال'],['bag','sac','حقيبه','حقيبة','شنطه','شنطة'],['passport','passeport','جواز','جواز سفر','travel document'],['meeting','appointment','appointments','rendez vous','rdv','reunion','موعد','مواعيد','اجتماع'],['doctor','physician','medecin','médecin','طبيب','الطبيب','دكتور'],['money','cash','argent','نقود','مال','فلوس'],['document','file','paper','fichier','dossier','ملف','وثيقه','مستند'],['place','location','where','ou','اين','وين','مكان'],['repair','fix','reparer','اصلاح','اصلح'],['instruction','steps','how','comment','خطوات','كيف'],['photo','picture','image','صور','صورة']];
const synonym=new Map();for(const group of groups)for(const v of group)synonym.set(norm(v),norm(group[0]));
function arabicForms(word){
 const forms=[word];
 // Keep this small: detach a definite article and common possessive endings.
 // This makes المفتاح / مفتاحي / مفاتيحي refer to the saved مفتاح / مفاتيح.
 for(const form of [...forms])if(form.startsWith('ال')&&form.length>=5)forms.push(form.slice(2));
 for(const form of [...forms])for(const suffix of ['هما','هم','ها','نا','ي','ه'])if(form.endsWith(suffix)&&form.length-suffix.length>=4)forms.push(form.slice(0,-suffix.length));
 return [...new Set(forms)]
}
function concept(word){
 if(synonym.has(word))return synonym.get(word);
 if(!/^[\u0621-\u064a]+$/u.test(word))return word;
 for(const form of arabicForms(word))if(synonym.has(form))return synonym.get(form);
 return arabicForms(word).find(form=>form!==word&&form.length>=4)||word
}
function terms(s){let n=norm(s);for(const [word,canonical] of synonym){if(word.includes(' '))n=n.replace(new RegExp('(?:^| )'+word+'(?= |$)','gu'),' '+canonical)}return n.split(' ').filter(w=>w.length>1&&!stop.has(w)).map(concept).filter(w=>!stop.has(w))}
function distance(a,b,limit){if(Math.abs(a.length-b.length)>limit)return limit+1;let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=row}return prev[b.length]}
function matchToken(w,field){const ws=terms(field);for(const word of ws)if(word===w||word.startsWith(w)&&w.length>=4)return 1;const lim=w.length>=8?2:w.length>=5?1:0;return lim&&ws.some(word=>distance(word,w,lim)<=lim)?.66:0}
function fieldText(m){return [{key:'title',value:m.title||'',weight:7},{key:'place',value:m.place||'',weight:7},{key:'person',value:m.person||'',weight:6},{key:'content',value:m.content||'',weight:4},{key:'purpose',value:m.purpose||'',weight:4},{key:'steps',value:m.steps||'',weight:4},{key:'repair',value:m.repair||'',weight:4},{key:'documentUse',value:m.documentUse||'',weight:4},...(m.files||[]).flatMap(f=>[{key:'filename',value:f.name||'',weight:5,file:f},{key:'filetext',value:f.text||'',weight:2.5,file:f}])].filter(f=>f.value)}
function rank(query,m){const q=terms(query),fields=fieldText(m);if(!q.length)return {score:0};let value=0,hits=0,best=null;for(const word of [...new Set(q)]){let top=0,source=null;for(const f of fields){const x=matchToken(word,norm(f.value))*f.weight;if(x>top){top=x;source=f}}if(top){value+=top;hits++;if(!best||top>best.weight)best={...source,weight:top}}}return {score:hits?value*(.5+.5*hits/new Set(q).size):0,source:best,hits}}
function excerpt(value,query){const s=String(value||'').replace(/\s+/g,' ').trim(),q=terms(query);let at=q.map(w=>norm(s).indexOf(w)).filter(i=>i>=0)[0]??0;if(at<0)at=0;const start=Math.max(0,at-70),end=Math.min(s.length,start+260);return (start?'…':'')+s.slice(start,end)+(end<s.length?'…':'')}
function intent(q){const n=norm(q);if(/\b(where|location|place|ou|endroit|ranger|mis|put)\b|اين|وين|فين|مكان/.test(n))return 'place';if(/\b(when|date|time|quand|heure)\b|متى|ساعة/.test(n))return 'dateAt';if(/\b(fix|repair|reparer|depanner)\b|اصلح|اصلاح/.test(n))return 'repair';if(/\b(how|steps|comment|instructions)\b|كيف|خطوات/.test(n))return 'steps';if(/\b(extract|obtain|document|pdf|obtenir)\b|استخراج|مستند/.test(n))return 'documentUse';if(/\b(why|purpose|used for|a quoi)\b|فائدة|يستعمل/.test(n))return 'purpose';return ''}
function extractLocation(value){
 const s=String(value||'').trim();
 const matched=s.match(/(?:^|[\s،,:;؛])((?:فوق|تحت|داخل|بداخل|في|بجانب|جنب|قرب|وراء|خلف|امام|أمام|عند|بين|على|on top of|next to|underneath|inside|behind|above|below|under|near|on|in|sur|dans|sous|derriere|derrière|pres de|près de|a cote de|à côté de)\s+[^.!؟?،,؛;\n]{2,120})/iu);
 return matched?matched[1].replace(/[\s.]+$/,'').trim():''
}
const categoryWords={
 guide:['how to','steps','instructions','procedure','manual','repair','troubleshoot','fix it','recipe','mode d emploi','comment faire','comment utiliser','etapes','reparer','fonctionnement','كيفية','طريقة','خطوات','تعليمات','دليل','تصليح','اصلاح','كيف يعمل','كيف اصلح','وصفة'],
 event:['appointment','appointments','meeting','meetings','event','interview','birthday','exam','flight','reservation','dentist','doctor','consultation','dinner','lunch','concert','party','rendez vous','rdv','reunion','entretien','anniversaire','examen','vol','medecin','dentiste','dejeuner','soiree','موعد','مواعيد','اجتماع','مقابلة','مقابله','طبيب','الطبيب','دكتور','زيارة الطبيب','عيد ميلاد','امتحان','رحلة','حجز','عشاء','غداء','حفلة'],
 task:['task','todo','to do','deadline','need to','must','have to','remind me to','pay','submit','send','call','call back','buy','renew','finish','devoir','je dois','il faut','echeance','payer','envoyer','soumettre','appeler','acheter','renouveler','لازم','يجب','علي ان','لا بد','ادفع','سدد','ارسال','ارسل','اتصل','شراء','اشتري','اجدد','تجديد','تسليم','المهلة'],
 thing:['put','left it','stored','placed','kept','drawer','shelf','keys','wallet','glasses','bag','passport','where i left','j ai mis','laisse','range','tiroir','etagere','cles','portefeuille','lunettes','sac','passeport','وضعت','حطيت','حط','تركت','خبيت','مفاتيح','محفظة','نظارة','نظارات','شنطة','حقيبة','درج','خزانة','جواز'],
 document:['document','documents','pdf','certificate','contract','form','license','invoice','receipt','file','paper','document administratif','attestation','contrat','formulaire','facture','recu','permis','شهادة','وثيقة','وثيقه','مستند','ملف','عقد','استمارة','فاتورة','رخصة','ورقة'],
 money:['money','cash','balance','bank account','debt','amount','savings','budget','dollars','euros','dinars','argent','especes','solde','compte bancaire','dette','montant','epargne','مال','فلوس','نقود','رصيد','حساب بنكي','مبلغ','دين','ميزانية','ادخار','دينار','دنانير','دولار','يورو'],
 person:['contact','phone number','telephone number','address of','person','friend','colleague','family','numéro de téléphone','numero de telephone','coordonnees','ami','amie','collegue','رقم هاتف','رقم تلفون','عنوان شخص','صديق','صديقة','زميل','عائلتي','اسم الشخص'],
 idea:['idea','brainstorm','concept','thought','invention','project idea','idee','idée','projet','concept','فكرة','افكار','اقتراح','مشروع','اختراع']
};
const categoryPriority=['guide','task','event','thing','document','money','person','idea'];
function hasPhrase(n,phrase){const p=norm(phrase);return (' '+n+' ').includes(' '+p+' ')}
function classify(text){
 const n=norm(text),points=Object.fromEntries(categoryPriority.map(k=>[k,0]));
 for(const [kind,phrases] of Object.entries(categoryWords))for(const phrase of phrases)if(hasPhrase(n,phrase))points[kind]+=phrase.includes(' ')?5:4;
 if(/(?:^| )(?:put|placed|stored|rang[e]?|mis|laisse|وضعت|حطيت|حط|تركت|خبيت)(?: |$)/.test(n))points.thing+=5;
 if(/(?:^| )\d+(?: |$)/.test(n)&&/(?:^| )(?:dollars?|euros?|dinars?|dzd|دينار|دنانير|دولار|يورو)(?: |$)/.test(n))points.money+=8;
 if(/(?:phone|telephone|هاتف|تلفون) (?:number|numéro|numero|is|est|هو|هي|:)? ?\d{3,}/.test(n))points.person+=6;
 if(/(?:^| )(?:need to|must|have to|je dois|il faut|لازم|يجب|علي ان)(?: |$)/.test(n))points.task+=4;
 if(/(?:^| )(?:how to|comment faire|كيفية|طريقة|خطوات)(?: |$)/.test(n))points.guide+=4;
 if(/(?:^| )(?:meeting|appointment|rendez vous|rdv|موعد|مواعيد|اجتماع)(?: |$)/.test(n))points.event+=4;
 const when=parseWhen(text);if(when.status==='complete')points.event+=2;
 const ranked=categoryPriority.map(kind=>({kind,score:points[kind]})).sort((a,b)=>b.score-a.score||categoryPriority.indexOf(a.kind)-categoryPriority.indexOf(b.kind));
 const best=ranked[0],second=ranked[1];
 if(best.score===0)return {kind:'note',confidence:'low'};
 if(best.score===2)return {kind:'event',confidence:'medium'};
 // A scheduled payment is a task; a thing deliberately placed somewhere is a place memory.
 if(best.kind==='money'&&points.task>=4)return {kind:'task',confidence:'high'};
 if(best.kind==='document'&&points.thing>=9)return {kind:'thing',confidence:'high'};
 return {kind:best.kind,confidence:best.score>=4&&(best.score-second.score>=4||best.score>=8&&best.score-second.score>=2)?'high':'medium'}
}
window.RemembraSmart={norm,parseWhen,terms,rank,excerpt,intent,extractLocation,classify};
})();
