export function formatPrice(value) {
  const amount = Number(value) || 0;
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)} TL`;
}

export function formatTimestamp(value) {
  if (!value) return '';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('tr-TR');
}

export function averageRating(post) {
  const ratings = (post?.comments || [])
    .map((comment) => Number(comment.rating))
    .filter((rating) => !Number.isNaN(rating));
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

export function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return `${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)}`;
}

export function parseAmount(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) return NaN;
  return Number(normalized);
}

export function labelGender(value) {
  if (value === 'erkek') return 'Erkek';
  if (value === 'kadın') return 'Kadın';
  return value || '-';
}

export function displayNameOf(profile, user) {
  if (profile?.fullName) return profile.fullName;
  const email = user?.email || '';
  if (email.includes('@')) return email.split('@')[0];
  return 'Kullanıcı';
}

export function toUserMessage(error) {
  const code = error?.code || '';
  const messages = {
    'auth/invalid-email': 'E-posta adresi geçersiz.',
    'auth/user-not-found': 'Bu e-posta ile kayıtlı hesap bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kayıtlı.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
    'auth/too-many-requests': 'Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.',
    'auth/network-request-failed': 'İnternet bağlantısı kurulamadı.',
    'auth/missing-password': 'Şifre gerekli.',
    'permission-denied':
      'Firebase izinleri bu işlemi engelledi. Firestore ve Storage kurallarının yayınlanmış olması gerekir.',
    unavailable: 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.',
  };

  if (messages[code]) return messages[code];
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return 'Beklenmeyen bir hata oluştu.';
}
