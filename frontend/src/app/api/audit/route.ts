import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const repoName = body.repo;
    const db = getDb();

    // Check if repo exists
    const repo = db.prepare('SELECT * FROM repositories WHERE name = ?').get(repoName);
    if (!repo) return NextResponse.json({ error: 'Repository not found' }, { status: 404 });

    // 1. Create a "Full History" mock scan
    const insertScan = db.prepare(`
      INSERT INTO scans (repo, commit_hash, branch, timestamp, author, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    // Simulating it taking some time in the past or being a deep scan
    const result = insertScan.run(
      repoName,
      'HISTORY',
      'deep-audit',
      new Date().toISOString(),
      'Semvi Auditor',
      'completed'
    );
    const scanId = result.lastInsertRowid as number;

    // 2. Insert interesting historical findings
    const insertFinding = db.prepare(`
      INSERT INTO findings (scan_id, kind, title, severity, path, line, snippet, summary, remediation, lane, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Finding 1: An old AWS Key
    insertFinding.run(
      scanId,
      'secret',
      'Legacy AWS Access Key Exposure',
      'critical',
      'config/aws_legacy_vars.txt',
      12,
      'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      'A hardcoded AWS credential was found buried deep in the commit history.',
      'Even if this file is deleted or changed now, the key remains exposed in the git tree. It must be immediately rotated if valid.',
      'fix-now',
      'open'
    );

    // Finding 2: Very old vulnerable dependency 
    insertFinding.run(
      scanId,
      'cve',
      'Ancient Vulnerability in Log4j (CVE-2021-44228)',
      'critical',
      'legacy_services/pom.xml',
      34,
      '<dependency>\n  <groupId>org.apache.logging.log4j</groupId>\n  <artifactId>log4j-core</artifactId>\n  <version>2.14.1</version>\n</dependency>',
      'The Log4Shell vulnerability was found in a legacy module deep within the git history.',
      'If this module is ever built or deployed in older pipelines, it presents a critical remote code execution vector.',
      'fix-now',
      'open'
    );

    // 3. Drop health score drastically since criticals were found
    db.prepare('UPDATE repositories SET health_score = ? WHERE name = ?').run(45, repoName);

    // Give it a brief intentional delay to make the UI "Running" state feel real
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ success: true, message: 'Audit complete' });

  } catch (error: any) {
    console.error('Audit Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
