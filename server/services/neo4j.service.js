import config from '../config/index.js';

/**
 * Neo4j graph service — manages investigation entities and relationships.
 */

let _driver = null;

export function setDriver(driver) {
  _driver = driver;
}

function getSession() {
  if (!_driver) throw Object.assign(new Error('Neo4j not connected'), { status: 503 });
  return _driver.session();
}

/**
 * Run a Cypher query and return records.
 */
async function run(cypher, params = {}) {
  const session = getSession();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

// ── Node operations ─────────────────────────────

export async function upsertVendor(vendor) {
  await run(
    `MERGE (v:Vendor {mongoId: $mongoId})
     SET v.name = $name, v.riskLevel = $riskLevel, v.aliases = $aliases`,
    { mongoId: vendor._id.toString(), name: vendor.name, riskLevel: vendor.riskLevel, aliases: vendor.aliases || [] }
  );
}

export async function upsertMessage(msg) {
  await run(
    `MERGE (m:Message {mongoId: $mongoId})
     SET m.text = $text, m.classification = $classification, m.timestamp = $timestamp`,
    { mongoId: msg._id.toString(), text: (msg.text || '').substring(0, 200), classification: msg.classification?.label || 'UNCLASSIFIED', timestamp: msg.timestamp?.toISOString() || '' }
  );
}

export async function upsertWallet(wallet) {
  await run(
    `MERGE (w:Wallet {address: $address})
     SET w.riskScore = $riskScore, w.blockchain = $blockchain`,
    { address: wallet.address, riskScore: wallet.riskScore || 0, blockchain: wallet.blockchain || 'ETH' }
  );
}

export async function upsertChannel(channel) {
  await run(
    `MERGE (c:Channel {channelId: $channelId})
     SET c.title = $title`,
    { channelId: channel.channelId, title: channel.title || '' }
  );
}

export async function upsertCase(caseDoc) {
  await run(
    `MERGE (c:Case {mongoId: $mongoId})
     SET c.caseNumber = $caseNumber, c.title = $title, c.status = $status`,
    { mongoId: caseDoc._id.toString(), caseNumber: caseDoc.caseNumber, title: caseDoc.title, status: caseDoc.status }
  );
}

// ── Relationship operations ─────────────────────

export async function createRelationship(fromLabel, fromKey, fromValue, toLabel, toKey, toValue, relType, properties = {}) {
  const propsStr = Object.keys(properties).length > 0
    ? 'SET ' + Object.keys(properties).map(k => `r.${k} = $prop_${k}`).join(', ')
    : '';
  const params = { fromValue, toValue };
  for (const [k, v] of Object.entries(properties)) params[`prop_${k}`] = v;

  await run(
    `MATCH (a:${fromLabel} {${fromKey}: $fromValue})
     MATCH (b:${toLabel} {${toKey}: $toValue})
     MERGE (a)-[r:${relType}]->(b)
     ${propsStr}`,
    params
  );
}

// Convenience methods
export async function vendorPostedMessage(vendorId, messageId) {
  await createRelationship('Vendor', 'mongoId', vendorId, 'Message', 'mongoId', messageId, 'POSTED');
}

export async function vendorUsesWallet(vendorId, walletAddress) {
  await createRelationship('Vendor', 'mongoId', vendorId, 'Wallet', 'address', walletAddress, 'USES_WALLET');
}

export async function possibleAlias(vendorIdA, vendorIdB, similarity) {
  await createRelationship('Vendor', 'mongoId', vendorIdA, 'Vendor', 'mongoId', vendorIdB, 'POSSIBLE_ALIAS_OF', { similarity });
}

export async function similarWritingStyle(vendorIdA, vendorIdB, similarity) {
  await createRelationship('Vendor', 'mongoId', vendorIdA, 'Vendor', 'mongoId', vendorIdB, 'SIMILAR_WRITING_STYLE', { similarity });
}

export async function walletTransferredTo(fromAddress, toAddress) {
  await createRelationship('Wallet', 'address', fromAddress, 'Wallet', 'address', toAddress, 'TRANSFERRED_TO');
}

export async function partOfCase(entityLabel, entityKey, entityValue, caseId) {
  await createRelationship(entityLabel, entityKey, entityValue, 'Case', 'mongoId', caseId, 'PART_OF_CASE');
}

// ── Query operations ────────────────────────────

/**
 * Get the full graph for Cytoscape.js visualization.
 */
export async function getFullGraph() {
  if (!_driver) return { nodes: [], edges: [] };

  const nodesResult = await run(
    `MATCH (n) RETURN n, labels(n) as labels, elementId(n) as eid`
  );

  const edgesResult = await run(
    `MATCH (a)-[r]->(b) RETURN type(r) as type, properties(r) as props, elementId(a) as source, elementId(b) as target, elementId(r) as eid`
  );

  const nodes = nodesResult.map(r => {
    const node = r.get('n');
    const labels = r.get('labels');
    return {
      id: r.get('eid'),
      labels,
      properties: node.properties,
    };
  });

  const edges = edgesResult.map(r => ({
    id: r.get('eid'),
    type: r.get('type'),
    properties: r.get('props'),
    source: r.get('source'),
    target: r.get('target'),
  }));

  return { nodes, edges };
}

/**
 * Clear all nodes and relationships (for seed reset).
 */
export async function clearGraph() {
  if (!_driver) return;
  await run('MATCH (n) DETACH DELETE n');
}
