/**
 * Sanitized security writeups for the public archive.
 * Program names, target domains, raw identifiers, secrets, and personal data
 * are intentionally excluded from the public presentation.
 */

export type Writeup = {
  title: string;
  code: string;
  category: string;
  desc: string;
  habitat: string;
  img: string;
  alt: string;
  aspect: string;
  layout: string;
  offset: string;
  mobile: string;
  rot: number;
  plx: number;
  status: string;
  severity: string;
  finding: string;
  background: string;
  discovery: string;
  technical: string;
  challenge: string;
  requestSnippet: string;
  takeaways: string[];
  summary: string;
  attackPath: string[];
  impact: string;
  rootCause: string;
  scopeNote: string;
  evidence: string[];
  remediation: string[];
  tags: string[];
};

export const WRITEUPS: Writeup[] = [
  {
    title: "Trusted Identity Spoofing",
    code: "CASE-0001",
    category: "Authorization — scheduling plane",
    desc: "A compromised node identity can publish resource metadata under a trusted driver name and steer victim workloads onto attacker-controlled infrastructure.",
    habitat: "BOUNDARY — publisher authority",
    img: "/archive/sp-01.webp",
    alt: "Abstract specimen plate representing a hostile resource claim and a broken trust boundary",
    aspect: "aspect-[4/5]",
    layout: "lg:col-start-1 lg:col-span-5",
    offset: "lg:mt-0",
    mobile: "w-[92%]",
    rot: -1.5,
    plx: 12,
    status: "Triaged",
    severity: "Critical",
    finding: "A node identity can publish resource data under another trusted driver identity because the server validates the node name but not the authority behind the driver and pool fields.",
    background: "While studying how a cluster allocates specialized resources, I focused on the boundary between what a node is allowed to publish and what the scheduler is allowed to trust. The interesting question was simple: does an authenticated node identity also prove ownership of every resource identity it claims?",
    discovery: "The first useful signal was not a successful attack; it was a mismatch in validation. The admission layer checked that the slice belonged to the requesting node, but the fields that named the driver and pool were only checked for format. That became the aha moment: the request was authenticated, but the identity inside the request was still attacker-selected.",
    technical: "The scheduler consumed the published slice as authoritative device inventory. A hostile node could therefore advertise a fabricated device under a trusted driver name. The scheduler placed a victim claim on that device, and the node agent accepted a matching plugin registration without independently proving the publisher identity. The chain crossed three trust boundaries: API admission, scheduling, and resource preparation.",
    challenge: "The main challenge was proving this was not a broad node privilege or cluster-admin issue. Control requests from the same node identity remained denied, so the reproduction stayed focused on the resource object and the downstream trust decision.",
    requestSnippet: "POST /api/resource-slices\nAuthorization: <legitimate-node-credential>\n\n{\n  \"driver\": \"<trusted-driver>\",\n  \"nodeName\": \"<attacker-node>\",\n  \"pool\": {\"name\": \"<attacker-controlled-pool>\"},\n  \"devices\": [{\"name\": \"<fabricated-device>\"}]\n}",
    takeaways: ["Do not confuse authentication of a node with authorization of every identity it publishes.", "Validate publisher ownership at the API boundary and again before a scheduler consumes the data.", "For researchers, compare the fields an admission rule validates with the fields downstream components actually trust."],
    summary: "The resource allocator trusted attacker-controlled driver and pool identity fields published by a legitimate node. Node-level admission checked the node name but never verified who was authorized to publish the claimed device identity.",
    attackPath: ["Compromised node obtains only its own legitimate node credential.", "Node publishes a fabricated resource description using a trusted driver identity.", "Scheduler allocates a victim claim against the fabricated device.", "A matching fake plugin prepares the claim and injects attacker-controlled resource artifacts."],
    impact: "A node holding only its own legitimate kubelet credential could make a victim claim resolve to a fabricated device, schedule the victim pod onto the attacker node, and register a fake driver that injected attacker-controlled resource artifacts into the running container.",
    rootCause: "Publisher authority is not bound to the resource identity consumed by the scheduler and node agent. The lower-trust node can choose the fields that downstream components treat as trusted identity.",
    scopeNote: "Demonstrated in a stock, default-configuration cluster with read/write proof limited to researcher-controlled workloads.",
    evidence: ["Stock cluster configuration with default node authorization and admission restrictions.", "Control actions remained denied for the same node identity, isolating the defect to resource-slice content.", "A hostile slice was accepted, the victim workload was scheduled, and the final container-side artifact was observed."],
    remediation: ["Bind published driver and pool identity to an authorized node-local plugin.", "Enforce driver/pool ownership and uniqueness server-side, not only in the client plugin.", "Add regression coverage for foreign driver, pool, and device claims."],
    tags: ["Container security", "Resource allocation", "Node identity"],
  },
  {
    title: "Persistent Anonymous State",
    code: "CASE-0002",
    category: "Authorization — state management",
    desc: "An unauthenticated client can mint a state token, persist arbitrary application and map values, and make the production SPA consume that state.",
    habitat: "BOUNDARY — token ownership",
    img: "/archive/sp-02.webp",
    alt: "Abstract specimen plate representing persistent anonymous application state and a token-bound map",
    aspect: "aspect-[1/1]",
    layout: "lg:col-start-7 lg:col-span-4",
    offset: "lg:mt-40",
    mobile: "ml-auto w-[88%]",
    rot: 2,
    plx: -18,
    status: "Submitted",
    severity: "High",
    finding: "An unauthenticated state workflow treats a client-created token as sufficient authority to create and persist application, map, and layer state.",
    background: "The application exposed a token-based workflow for saving map and application state. At first glance it looked like a normal anonymous session mechanism, so I followed the token through the full lifecycle instead of judging the initial token response in isolation.",
    discovery: "The turning point came when a state value written in one request was returned by a later, cookie-less read. That ruled out simple reflection. The token was acting as a durable capability, but nothing in the flow tied it to a user, session, expiry, or ownership check.",
    technical: "The workflow allowed a client to mint a token, send arbitrary nested application state, replace map properties, and update per-layer values. The deployed frontend also accepted the same token from the URL, meaning attacker-created state was not stranded in an unused backend record; it was addressable and consumed by the real application.",
    challenge: "The important challenge was separating persistent state manipulation from a harmless client-side preference. Independent read-back and a browser/network check showed the values survived the original request and were later consumed by the application. Testing stayed within attacker-created state and did not touch shared catalog data.",
    requestSnippet: "GET /<state-resource>/\n\nHTTP/1.1 200 OK\n{\"token\": \"<attacker-created-token>\"}\n\nPATCH /<state-resource>/?token=<redacted>\n{\"application\": {\"marker\": \"<controlled-value>\"}}\n\nGET /<state-resource>/?token=<redacted>\n{\"application\": {\"marker\": \"<controlled-value>\"}}",
    takeaways: ["A random-looking token is not an authorization model by itself.", "Always bind anonymous capabilities to scope, expiry, integrity, and an explicit owner.", "For researchers, verify persistence with an independent read-back and then verify whether the production client consumes the state."],
    summary: "A public state workflow accepted a client-created token as the only selector for server-side application, map, and per-layer state. The same state remained readable after the original write and was accepted by the deployed frontend through a URL token.",
    attackPath: ["Anonymous client requests a new state token.", "Client writes attacker-controlled application state using that token.", "Client replaces map and layer properties and reads them back independently.", "A crafted URL causes the deployed SPA to consume the attacker-selected state."],
    impact: "An attacker could create persistent attacker-controlled state and bind a visitor session to it through a crafted link. The testing demonstrated durable state manipulation without authentication, CSRF protection, or an account boundary.",
    rootCause: "The token functions as an object identifier but is accepted as if it were proof of ownership. Mutation and read paths do not establish a principal-to-state relationship.",
    scopeNote: "Testing used attacker-created state only; no shared catalog or other user's state was modified.",
    evidence: ["Token creation, application-state write, and independent read-back were reproduced without cookies.", "Map and per-layer properties survived separate mutation and read-back requests.", "Browser and network evidence showed the production SPA consuming token-selected state."],
    remediation: ["Require authenticated ownership or a server-issued capability with explicit scope and expiry.", "Validate every state mutation against the owning principal and object.", "Do not let arbitrary URL tokens select persistent application state for visitors."],
    tags: ["State security", "Persistence", "SPA"],
  },
  {
    title: "Protected Record Exposure",
    code: "CASE-0003",
    category: "Access control — personnel data",
    desc: "Object-specific service methods return populated personnel records to anonymous callers who supply valid object identifiers.",
    habitat: "BOUNDARY — object ownership",
    img: "/archive/sp-03.webp",
    alt: "Abstract specimen plate representing an exposed personnel record behind an object identifier",
    aspect: "aspect-[4/5]",
    layout: "lg:col-start-3 lg:col-span-4",
    offset: "lg:-mt-10",
    mobile: "w-[90%]",
    rot: 1.5,
    plx: 22,
    status: "Submitted",
    severity: "High",
    finding: "Object-specific profile methods return protected personnel records when a caller supplies a valid object identifier, without first requiring authentication or object authorization.",
    background: "The application had public lookup behavior and authenticated profile-management behavior. I compared those paths rather than assuming that every service method exposed the same intended data set.",
    discovery: "The aha moment was the contrast between identifiers. Empty or fabricated identifiers returned an empty sentinel, while real identifiers returned populated records to an anonymous request. That response difference showed that the service was resolving protected objects, not merely serving a public directory shell.",
    technical: "The service accepted a client-supplied object key and returned a multi-field personnel record without establishing an authenticated principal. A second table-style method accepted a user scope and returned populated references as well. The object lookup was effectively being treated as proof of authorization.",
    challenge: "The challenge was maintaining a strict privacy boundary while proving impact. I used a bounded set of real identifiers, masked sensitive values in evidence, avoided writes and bulk export, and used empty/fabricated identifiers as controls.",
    requestSnippet: "POST /<profile-service>/<object-method>\nContent-Type: application/json\n\n{\"objectKey\": <redacted-valid-id>}\n\nHTTP/1.1 200 OK\n{\"record\": {\"name\": \"<redacted>\", \"contact\": \"<redacted>\", \"organization\": \"<redacted>\"}}",
    takeaways: ["Object identifiers are references, not authorization proofs.", "Public lookup endpoints and authenticated profile endpoints need separate server-side policies.", "For researchers, use negative controls and minimize the amount of personal data retained in evidence."],
    summary: "Two object-level service methods used by an authenticated profile workflow accepted real record identifiers without establishing an authenticated principal or checking object authorization.",
    attackPath: ["Anonymous caller sends an object-specific lookup request.", "A valid identifier selects a real personnel record.", "The service returns a populated record instead of a uniform authorization denial.", "The same behavior reproduces across multiple independent identifiers."],
    impact: "The response exposed combinations of identity, direct contact channels, physical-address fields, organizational relationships, and internal object identifiers. Testing stayed read-only and did not export the complete dataset.",
    rootCause: "The service layer exposes an object lookup without carrying the authenticated principal and ownership check expected by the surrounding profile workflow.",
    scopeNote: "Evidence was minimized and sensitive field values were masked; no write operation or bulk export was performed.",
    evidence: ["Anonymous requests returned populated records for multiple independent identifiers.", "Fabricated and empty identifiers returned an empty sentinel instead of a populated record.", "Generic public lookup methods returned no rows while the object-specific methods returned data."],
    remediation: ["Require authentication before resolving profile and personnel objects.", "Authorize each requested object against the caller, not only the service method.", "Return a uniform denial for missing, invalid, and unauthorized identifiers."],
    tags: ["Object access", "Service layer", "Sensitive data"],
  },
  {
    title: "Cross-Tenant Object Graph",
    code: "CASE-0004",
    category: "Authorization — tenant isolation",
    desc: "A low-privilege tenant can use a nested resolver to retrieve foreign objects and traverse into operational, advertising, and analytics data.",
    habitat: "BOUNDARY — tenant ownership",
    img: "/archive/sp-04.webp",
    alt: "Abstract specimen plate representing a cross-tenant object graph and a broken authorization boundary",
    aspect: "aspect-[4/5]",
    layout: "lg:col-start-8 lg:col-span-5",
    offset: "lg:mt-24",
    mobile: "ml-auto w-[92%]",
    rot: -2,
    plx: -12,
    status: "Under review",
    severity: "High",
    finding: "A nested object resolver authorizes the caller's outer tenant context but fails to verify that the requested object belongs to that tenant.",
    background: "I was tracing how a low-privilege tenant reached analytics objects through different resolver paths. The goal was to compare the normal organization-scoped route with nested convenience resolvers that accepted caller-supplied IDs.",
    discovery: "The aha moment was a clean differential: the same caller and same foreign object were denied through the standard resolver but returned through a nested advisor path. That made the issue an authorization inconsistency, not a question about whether the underlying podcast or feed was public.",
    technical: "The outer organization context was authorized correctly, but the nested resolver treated that authorization as permission to resolve any child ID. Once the foreign object was returned, relationships exposed additional operational and analytics fields. The evidence separated public-equivalent metadata from tenant-private application data and used a bounded amplification sample.",
    challenge: "The biggest challenge was proving meaningful confidentiality impact without collecting an entire foreign dataset. I reproduced the differential across unrelated tenants, retained only representative rows, and redacted tokens, cookies, personal data, and unnecessary records.",
    requestSnippet: "query {\n  me {\n    organization(id: \"<attacker-tenant>\") {\n      advisor {\n        object(id: \"<foreign-object>\") {\n          id\n          organization { id }\n          nestedData { <redacted-fields> }\n        }\n      }\n    }\n  }\n}\n\nResult: foreign object returned through nested path; standard path denied it.",
    takeaways: ["Authorize the object being returned, not only the parent context.", "Test the same object through every resolver and representation that can reach it.", "For public reports, distinguish public metadata from genuinely tenant-private data."],
    summary: "The standard organization-scoped resolver rejected a foreign object, but a nested advisor resolver returned the same object when given an attacker-supplied identifier. That resolver then exposed deeper relationships that the tenant should not reach.",
    attackPath: ["Low-privilege tenant authenticates normally.", "Caller supplies an object identifier belonging to another tenant.", "Standard resolver denies the object while the nested resolver returns it.", "Nested relationships expose additional operational and analytics data, with bounded amplification."],
    impact: "The demonstrated read-only chain crossed organizational boundaries into internal member identifiers, campaign and advertiser relationships, measurement metadata, storage references, and generated transcript data. A bounded relationship traversal showed large-scale amplification without harvesting the full result set.",
    rootCause: "The nested resolver trusts authorization of the outer tenant object and omits an ownership comparison for the caller-supplied child identifier.",
    scopeNote: "Reproduced across multiple unrelated tenants using a low-privilege account; all testing was read-only and foreign values were redacted.",
    evidence: ["The same caller and foreign object produced denial through the normal resolver and success through the nested resolver.", "The behavior reproduced against multiple unrelated organizations.", "Evidence was bounded, read-only, and redacted; public-equivalent metadata was separated from security-relevant fields."],
    remediation: ["Enforce object ownership inside every nested resolver before returning the object.", "Apply the same tenant check to feeds, ads, publishers, members, and analytics relations.", "Add own-object, foreign-object, and nonexistent-object regression cases."],
    tags: ["Object access", "Data graph", "Tenant isolation"],
  },
  {
    title: "Recovery Secret Exposure",
    code: "CASE-0005",
    category: "Authentication — account recovery",
    desc: "A staging password-reset flow returns a usable reset secret to an unauthenticated caller and then issues session credentials after the password change.",
    habitat: "BOUNDARY — proof of mailbox ownership",
    img: "/archive/sp-05.webp",
    alt: "Abstract specimen plate representing a password-reset chain with an exposed recovery secret",
    aspect: "aspect-[16/9]",
    layout: "lg:col-start-1 lg:col-span-6",
    offset: "lg:mt-20",
    mobile: "w-[94%]",
    rot: 1,
    plx: 16,
    status: "Submitted",
    severity: "Critical",
    finding: "An unauthenticated password-recovery request returns the live reset secret to the caller, allowing the next password-change step to complete without mailbox ownership proof.",
    background: "Password recovery normally begins publicly, but the recovery secret should be delivered out of band to the mailbox owner. I compared the recovery response with the expected email-link model and tested only a researcher-controlled staging account.",
    discovery: "The aha moment was a field that looked like a debug artifact in the initial response. It was not merely an account-existence signal: the returned value was accepted by the password-change step and the completion response issued session material.",
    technical: "The flow collapsed two separate trust steps into one API conversation. The first unauthenticated request accepted an email address and returned the credential needed by the second request. The second request accepted an attacker-selected password and created an authenticated session without inbox access or a prior login.",
    challenge: "The challenge was proving the chain without touching another person. A researcher-owned account demonstrated the positive path, a non-existent email supplied the negative control, and a separate production comparison showed the debug field was not part of the normal response there.",
    requestSnippet: "POST /<recovery-endpoint>\n{\"email\": \"<researcher-controlled-email>\"}\n\nHTTP/1.1 200 OK\n{\"__debug_reset_token\": \"<redacted>\"}\n\nPUT /<recovery-endpoint>\n{\"reset_token\": \"<redacted>\", \"password\": \"<redacted>\"}\n\nResult: password changed on owned test account; session response redacted.",
    takeaways: ["Recovery secrets must never be returned to the unauthenticated caller.", "Use short-lived, single-use, out-of-band reset links or codes.", "For researchers, prove account ownership and keep reset tokens, cookies, and session credentials out of public evidence."],
    summary: "The staging recovery API returned a live reset secret directly in the response to an unauthenticated email-based request. The secret was accepted by the completion step without inbox access, an existing session, or an email-link interaction.",
    attackPath: ["Unauthenticated caller submits a target email address.", "Recovery response returns a usable reset secret instead of delivering it out of band.", "Caller submits the secret with an attacker-chosen password.", "The completion response issues authenticated session material."],
    impact: "A caller who knows a staging customer's email can select a new password and receive authenticated session credentials in the same flow. The proof used only a researcher-controlled account, with production behavior checked separately as a control.",
    rootCause: "A debug/test response field exposes the recovery credential directly to the unauthenticated API client, collapsing email ownership verification into possession of an email address.",
    scopeNote: "The takeover chain was demonstrated only on a researcher-owned staging account; no third-party inbox, account, or credential was touched.",
    evidence: ["A non-existent email produced a distinct null control while the researcher-owned account produced a usable secret.", "The completion request accepted the secret and returned authenticated session material.", "No third-party account, inbox, credential, or personal data was used during the proof."],
    remediation: ["Never return reset secrets in unauthenticated API responses.", "Deliver recovery secrets out of band with short TTL and single-use enforcement.", "Remove debug fields from internet-reachable staging environments and audit equivalent paths."],
    tags: ["Account takeover", "Recovery flow", "Debug exposure"],
  },
];
