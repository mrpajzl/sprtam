#!/usr/bin/env python3
"""Replace the `ex: [...]` of one topic, keeping everything else (id, title, qs, gen) untouched.

Usage: python3 scripts/set-ex.py <subject-file.ts> <topic-id> <snippet.ts>
The snippet contains the whole property, starting with `ex: [` and ending with `],`.
"""
import re, sys

path, topic_id, snippet_path = sys.argv[1:4]
src = open(path, encoding='utf-8').read()
snippet = open(snippet_path, encoding='utf-8').read().strip()
if not snippet.startswith('ex: [') or not snippet.endswith('],'):
    sys.exit('snippet must start with "ex: [" and end with "],"')

m = re.search(r"id:\s*'" + re.escape(topic_id) + r"',", src)
if not m:
    sys.exit(f'topic {topic_id} not found')
ex = re.compile(r'^([ \t]*)ex:\s*\[', re.M).search(src, m.end())
qs = re.compile(r'^[ \t]*qs:\s*\[', re.M).search(src, m.end())
nxt = re.compile(r"id:\s*'", re.M).search(src, m.end())
if not ex or not qs or ex.start() > qs.start() or (nxt and qs.start() > nxt.start()):
    sys.exit('could not locate ex/qs of this topic')
indent = ex.group(1)
body = '\n'.join(indent + line if line.strip() else line for line in snippet.split('\n'))
# Re-indent: snippet lines are written relative to column 0.
src = src[:ex.start()] + body + '\n' + src[qs.start():]
open(path, 'w', encoding='utf-8').write(src)
print(f'{topic_id}: ex replaced')
