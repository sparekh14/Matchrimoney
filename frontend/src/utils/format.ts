// Date formatting utilities
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatDateShort = (dateString: string): string => {
  return formatDate(dateString, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days ago`;
  } else if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow';
  } else if (diffInDays <= 7) {
    return `In ${diffInDays} days`;
  } else if (diffInDays <= 30) {
    const weeks = Math.ceil(diffInDays / 7);
    return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
  } else if (diffInDays <= 365) {
    const months = Math.ceil(diffInDays / 30);
    return `In ${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.ceil(diffInDays / 365);
    return `In ${years} year${years > 1 ? 's' : ''}`;
  }
};

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatBudgetRange = (min: number, max: number): string => {
  if (min === max) {
    return formatCurrency(min);
  }
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

// Text formatting
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatVendorCategory = (category: string): string => {
  // Special cases that should remain all caps
  const specialCases: { [key: string]: string } = {
    'DJ': 'DJ',
  };
  
  return category
    .split('_')
    .map(word => specialCases[word] || capitalizeFirst(word))
    .join(' ');
};

// Location formatting
export const formatLocation = (location: string): { city: string; state: string } => {
  const parts = location.split(',').map(part => part.trim());
  const city = parts[0] || '';
  const state = parts[1] || '';
  return { city, state };
};

export const getLocationDistance = (location1: string, location2: string): string => {
  const loc1 = formatLocation(location1);
  const loc2 = formatLocation(location2);
  
  if (loc1.city === loc2.city && loc1.state === loc2.state) {
    return 'Same city';
  } else if (loc1.state === loc2.state) {
    return 'Same state';
  } else {
    return 'Different state';
  }
};

// Compatibility score formatting
export const formatCompatibilityScore = (score: number): string => {
  if (score >= 90) return 'Excellent Match';
  if (score >= 80) return 'Great Match';
  if (score >= 70) return 'Good Match';
  if (score >= 60) return 'Fair Match';
  return 'Poor Match';
};

export const getCompatibilityColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 60) return 'text-orange-500';
  return 'text-red-500';
};

// Time formatting
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return formatDateShort(dateString);
  }
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Couple name formatting
export const formatCoupleName = (user: { person1FirstName: string; person1LastName: string; person2FirstName: string; person2LastName: string }): string => {
  return `${user.person1FirstName} ${user.person1LastName} & ${user.person2FirstName} ${user.person2LastName}`;
};

export const formatCoupleFirstNames = (user: { person1FirstName: string; person2FirstName: string }): string => {
  return `${user.person1FirstName} & ${user.person2FirstName}`;
}; 