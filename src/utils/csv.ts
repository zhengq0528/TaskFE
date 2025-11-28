import type { Task, TaskCreateInput } from '../constants/types';

const CSV_HEADER = [
  'id',
  'title',
  'description',
  'status',
  'priority',
  'assignee',
  'dueDate',
  'createdAt',
  'updatedAt',
  'tags',
];

function escapeCsvValue(value: string | null | undefined): string {
  const v = value ?? '';
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

// Export current table view as CSV
export function tasksToCsv(tasks: Task[]): string {
  const lines: string[] = [];

  lines.push(CSV_HEADER.join(','));

  for (const t of tasks) {
    const row = [
      escapeCsvValue(t.id),
      escapeCsvValue(t.title),
      escapeCsvValue(t.description ?? ''),
      escapeCsvValue(t.status),
      escapeCsvValue(t.priority ?? ''),
      escapeCsvValue(t.assignee ?? ''),
      escapeCsvValue(t.dueDate ?? ''),
      escapeCsvValue(t.createdAt),
      escapeCsvValue(t.updatedAt ?? ''),
      escapeCsvValue((t.tags ?? []).join('|')), // tags joined by |
    ];
    lines.push(row.join(','));
  }

  return lines.join('\r\n');
}

// Import CSV -> TaskCreateInput[]
// We IGNORE id/createdAt/updatedAt from CSV and let backend regenerate them.
export function csvToTaskInputs(text: string): TaskCreateInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const body = lines.slice(1);

  const idx = (name: string) => header.indexOf(name);

  const idxTitle = idx('title');
  const idxDescription = idx('description');
  const idxStatus = idx('status');
  const idxPriority = idx('priority');
  const idxAssignee = idx('assignee');
  const idxDueDate = idx('duedate');
  const idxTags = idx('tags');

  const inputs: TaskCreateInput[] = [];

  for (const line of body) {
    if (!line) continue;
    const cols = line.split(',');

    const title = idxTitle >= 0 ? cols[idxTitle]?.trim() : '';
    const status = idxStatus >= 0 ? cols[idxStatus]?.trim() : '';

    if (!title || !status) continue;

    const description =
      idxDescription >= 0 ? cols[idxDescription]?.trim() : '';
    const priority = idxPriority >= 0 ? cols[idxPriority]?.trim() : '';
    const assignee = idxAssignee >= 0 ? cols[idxAssignee]?.trim() : '';
    const dueDate = idxDueDate >= 0 ? cols[idxDueDate]?.trim() : '';
    const tagsRaw = idxTags >= 0 ? cols[idxTags]?.trim() : '';

    const tags =
      tagsRaw
        ?.split('|')
        .map((t) => t.trim())
        .filter(Boolean) ?? [];

    inputs.push({
      title,
      description: description || undefined,
      status: status as any,
      priority: (priority as any) || undefined,
      assignee: assignee || undefined,
      dueDate: dueDate || "",
      tags: tags.length > 0 ? tags : undefined,
    });
  }

  return inputs;
}
