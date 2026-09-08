import json,csv,pathlib,urllib.parse,sys
root=pathlib.Path(__file__).resolve().parent.parent; ev=pathlib.Path(sys.argv[1]); out=root/'content/english-audit'
read=lambda p:json.loads(p.read_text())
pages=read(ev/'before/pages.json');cms=read(ev/'before/cms-public.json');base=read(ev/'repository-production-base.json');edited=read(ev/'repository-edited.json')
def flatten(x,p=()):
 if isinstance(x,dict):
  for k,v in x.items():
   if k!='ar':yield from flatten(v,p+(k,))
 elif isinstance(x,list):
  for k,v in enumerate(x):yield from flatten(v,p+(k,))
 elif isinstance(x,str):yield p,x
old=dict(flatten(base));new=dict(flatten(edited));delta=[{'path':list(k),'before':old.get(k),'after':v} for k,v in new.items() if old.get(k)!=v]
(out/'repository-field-diff.json').write_text(json.dumps(delta,ensure_ascii=False,indent=2)+'\n')
canonical=[p for p in pages if p['status']==200 and urllib.parse.urlparse(p['finalUrl']).path.rstrip('/')==p['route'].rstrip('/')]
cm={('/en'+x['path'].replace('/aesthetics/concerns/','/aesthetics/treatments/')).rstrip('/'):x for x in cms}
with (out/'route-inventory.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['route','http_status','content_authority','cms_type','cms_path','title','description','review_status','production_change_verified'])
 for p in canonical:
  c=cm.get(p['route']);t=c['payload']['type'] if c else ''
  w.writerow([p['route'],p['status'],'CMS_AUTHORITATIVE' if t in ['content_entry','person_profile'] else 'REPOSITORY_AUTHORITATIVE',t,c['path'] if c else '',p['title'],p['meta'].get('description',''),'REVIEW_IN_PROGRESS','NO'])
strings=[]
for p in canonical:
 for k,v in flatten({k:p[k] for k in ['title','meta','headings','strings','schema'] if k in p}):strings.append({'route':p['route'],'path':list(k),'text':v})
(ev/'production-string-inventory.json').write_text(json.dumps(strings,ensure_ascii=False,indent=2)+'\n')
ops=read(out/'replacements.json')['operations'];lookup={x['from']:x for x in ops}
# Whole-field draft only. Each known public-envelope path is mapped to the
# corresponding guarded operation shape; unsupported paths remain explicit
# manual-review records and can never be sent as unrestricted patches.
proposals=[]
for c in cms:
 if c['payload']['type'] not in ['content_entry','person_profile']:continue
 for path,value in flatten(c['payload']):
  if value in lookup and path[0] in ['data','relations']:
   o=lookup[value]
   proposal={'operationId':o['id'],'cmsPath':c['path'],'entityId':c['payload']['data']['id'],'publicEnvelopePath':list(path),'from':value,'to':o['to'],'status':'DRAFT_REQUIRES_PUBLISH_PERMISSION'}
   if path[:2] == ('data','fields'):
    proposal['adminOperation']={'kind':'entry.field.set','recordId':proposal['entityId'],'field':path[2]}
   elif path[:2] == ('relations','faqs') and len(path) == 4:
    faq=c['payload']['relations']['faqs'][path[2]]
    proposal['adminOperation']={'kind':'faq.update','recordId':proposal['entityId'],'faqId':faq['id'],'field':path[3]}
   elif path == ('data','biography'):
    proposal['adminOperation']={'kind':'person.biography.set','recordId':proposal['entityId'],'field':'biography'}
   else:
    proposal['status']='MANUAL_ADMIN_MAPPING_REQUIRED'
   proposals.append(proposal)
(out/'cms-exact-field-proposals.json').write_text(json.dumps(proposals,ensure_ascii=False,indent=2)+'\n')
metrics={'baselineCanonicalRoutes':len(canonical),'candidatePaths':len(pages),'cmsRecordsCaptured':len(cms),'cmsBodyEntities':sum(c['payload']['type'] in ['content_entry','person_profile'] for c in cms),'capturedStringOccurrences':len(strings),'capturedDistinctStrings':len(set(x['text'] for x in strings)),'repositoryChangedStringFields':len(delta),'exactCmsFieldProposals':len(proposals),'cmsRecordsWithExactProposals':len(set(x['entityId'] for x in proposals)),'note':'Capture and diff counts are not completed human-review counts. CMS proposal set is partial: inherited edits, structured fields and new aftercare need mapping.'}
(out/'coverage-progress.json').write_text(json.dumps(metrics,indent=2)+'\n');print(json.dumps(metrics,indent=2))
