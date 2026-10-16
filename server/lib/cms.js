import { DomainError } from './domain.js';

export const cmsEditorRoles = Object.freeze(['super_admin', 'hotel_manager', 'content_editor']);
export const cmsStatuses = Object.freeze(['draft', 'published']);

export function normalizePageInput(body = {}) {
  const slug = String(body.slug || '').trim().toLowerCase();
  const title = String(body.title || '').trim();
  const bodyText = String(body.body || '').trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) throw new DomainError('VALIDATION_ERROR', 'Slug must contain lowercase letters, numbers and hyphens.');
  if (!title || title.length > 180) throw new DomainError('VALIDATION_ERROR', 'Title is required and must be at most 180 characters.');
  if (!bodyText || bodyText.length > 50000) throw new DomainError('VALIDATION_ERROR', 'Content is required and must be at most 50,000 characters.');
  if (/<\/?[a-z][^>]*>/i.test(bodyText)) throw new DomainError('VALIDATION_ERROR', 'Content is plain text in this release; HTML is rejected for XSS safety.');
  return { slug, title, body: bodyText };
}

export function assertCmsEditor(session) {
  if (!session || !cmsEditorRoles.includes(session.role)) throw new DomainError('FORBIDDEN', 'Your staff role cannot edit content.', 403);
}