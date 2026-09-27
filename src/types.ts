export type NavigationScreen =
  | 'dashboard'
  | 'books'
  | 'poetry'
  | 'categories'
  | 'authors'
  | 'writers-requests'
  | 'users'
  | 'banners-popups'
  | 'rewards-config'
  | 'withdrawal-requests'
  | 'admin-team'
  | 'settings-ad-control';

export interface PoetryLine {
  id: string;
  lines_urdu: string;
  poet_name: string;
  genre?: string;
  likes_count: number;
  status: 'Published' | 'Draft';
  created_at: string;
}

export type BookStructureType = 'chapter_based' | 'full_book';
export type ContentDeliveryType = 'text' | 'pdf_upload' | 'pdf_url' | 'text_and_pdf';

export interface Book {
  id: string;
  title_en: string;
  title_urdu?: string;
  isbn?: string;
  author_id: string;
  author_name: string;
  author_urdu?: string;
  category_id: string;
  category_name: string;
  category_urdu?: string;
  cover_url: string;
  description?: string;
  total_chapters: number;
  word_count: number;
  reads_count: number;
  rating: number;
  is_locked: boolean;
  status: 'Approved' | 'Pending' | 'In Review' | 'Draft';
  structure_type?: BookStructureType; // 'chapter_based' | 'full_book'
  full_content?: string;
  full_content_type?: ContentDeliveryType;
  full_pdf_url?: string;
  full_pdf_storage_path?: string;
  full_pdf_file_name?: string;
  full_pdf_file_size?: string;
  full_pdf_pages?: number;
  created_at: string;
  updated_at: string;
}

export type ChapterContentType = 'text' | 'pdf' | 'pdf_upload' | 'pdf_url' | 'text_and_pdf';

export interface Chapter {
  id: string;
  book_id: string;
  chapter_no: number;
  title_en: string;
  title_urdu?: string;
  content_type: ChapterContentType;
  content_text_urdu?: string;
  content_pdf_url?: string;
  pdf_storage_path?: string;
  pdf_file_name?: string;
  pdf_file_size?: string;
  pdf_pages?: number;
  word_count?: number;
  is_locked: boolean;
  ad_gate: 'free' | 'reward_ad' | 'vip_points';
  status: 'Published' | 'Draft Review' | 'Scheduled';
  created_at: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_urdu: string;
  slug: string;
  icon: string;
  books_count: number;
  accent_color: string;
  description?: string;
}

export interface Author {
  id: string;
  name_en: string;
  name_urdu: string;
  avatar_url: string;
  bio?: string;
  total_books: number;
  total_readers: string;
  is_verified: boolean;
  email?: string;
}

export interface WriterRequest {
  id: string;
  book_id?: string;
  writer_name: string;
  writer_avatar?: string;
  is_verified_writer: boolean;
  is_first_novel: boolean;
  book_title_en: string;
  book_title_urdu: string;
  genre: string;
  submitted_date: string;
  cover_url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  word_count: number;
  submitted_chapters_count: number;
  format: string;
  synopsis_urdu: string;
  synopsis_en?: string;
  sample_chapter_title: string;
  sample_chapter_urdu: string;
  rejection_reason?: string;
  admin_notes?: string;
}

export interface UserMember {
  id: string;
  name: string;
  name_urdu?: string;
  email: string;
  avatar: string;
  bookmarks_count: number;
  chapters_read: number;
  joined_date: string;
  points_balance: number;
  tier: 'Standard' | 'Gold Reader' | 'Avid Reader' | 'VIP Scholar';
  is_admin: boolean;
  is_writer: boolean;
  status: 'active' | 'suspended';
}

export interface BannerPopup {
  id: string;
  title: string;
  image_url: string;
  linked_book_id?: string;
  linked_book_title?: string;
  position: 'home_popup' | 'header_banner' | 'interstitial_slide';
  is_active: boolean;
  clicks: number;
  impressions: number;
  created_at: string;
}

export interface RewardsConfig {
  points_per_chapter: number;
  points_per_ad: number;
  points_per_checkin: number;
  points_per_invite: number;
  conversion_points_per_pkr: number; // e.g. 100 points = 1 PKR
  min_withdrawal_points: number; // e.g. 10000
  // Difficulty Unlock Conditions
  min_chapters_read_to_unlock: number; // e.g. 50
  min_ads_watched_to_unlock: number; // e.g. 20
  min_friends_invited_to_unlock: number; // e.g. 3
  cooldown_days: number;
}

export type PaymentMethod = 'Easypaisa' | 'JazzCash';

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_name_urdu?: string;
  user_email: string;
  user_avatar: string;
  user_tier: string;
  points_redeemed: number;
  amount_pkr: number;
  payment_method: PaymentMethod;
  account_title: string;
  account_number: string;
  created_at: string;
  tasks_chapters_completed: number;
  tasks_chapters_required: number;
  tasks_ads_watched: number;
  tasks_ads_required: number;
  tasks_invites_completed: number;
  tasks_invites_required: number;
  is_flagged_fraud: boolean;
  fraud_reason?: string;
  device_model?: string;
  ip_address?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_at?: string;
  admin_note?: string;
}

export interface AdControlSettings {
  admob_app_id: string;
  banner_ad_unit_id: string;
  interstitial_ad_unit_id: string;
  rewarded_ad_unit_id: string;
  app_open_ad_unit_id: string;
  interstitial_frequency_chapters: number;
  rewarded_gate_threshold_chapter: number;
  is_test_mode: boolean;
  enable_banner_ads?: boolean;
  enable_interstitial_ads?: boolean;
  enable_rewarded_unlock?: boolean;
}

export type AdminRole = 'Super Admin' | 'Admin' | 'Manager' | 'Editor' | 'Moderator';

export interface AdminPermissions {
  manage_books: boolean; // Add, edit, delete books, chapters, categories, authors
  approve_writers: boolean; // Review, approve or reject writer manuscript applications
  manage_users: boolean; // View reader accounts, adjust rewards points & bans
  manage_rewards: boolean; // Edit conversion economy (PKR to Points) & unlock thresholds
  manage_withdrawals: boolean; // Disburse or reject Easypaisa & JazzCash payout requests
  manage_monetization: boolean; // AdMob Unit IDs, interstitial frequency & banner popups
  manage_team: boolean; // Invite, edit permissions, suspend or remove admin team members
  manage_settings: boolean; // Supabase database credentials, cloud wipe & SQL sync
}

export interface AdminTeamMember {
  id: string;
  name: string;
  username?: string;
  password?: string;
  email: string;
  phone?: string;
  role: AdminRole;
  status: 'Active' | 'Suspended' | 'Pending';
  avatar_url: string;
  permissions: AdminPermissions;
  assigned_by?: string;
  created_at: string;
  last_login?: string;
  notes?: string;
}

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  'Super Admin': {
    manage_books: true,
    approve_writers: true,
    manage_users: true,
    manage_rewards: true,
    manage_withdrawals: true,
    manage_monetization: true,
    manage_team: true,
    manage_settings: true
  },
  Admin: {
    manage_books: true,
    approve_writers: true,
    manage_users: true,
    manage_rewards: true,
    manage_withdrawals: true,
    manage_monetization: true,
    manage_team: false,
    manage_settings: false
  },
  Manager: {
    manage_books: true,
    approve_writers: true,
    manage_users: true,
    manage_rewards: false,
    manage_withdrawals: false,
    manage_monetization: false,
    manage_team: false,
    manage_settings: false
  },
  Editor: {
    manage_books: true,
    approve_writers: false,
    manage_users: false,
    manage_rewards: false,
    manage_withdrawals: false,
    manage_monetization: false,
    manage_team: false,
    manage_settings: false
  },
  Moderator: {
    manage_books: false,
    approve_writers: true,
    manage_users: true,
    manage_rewards: false,
    manage_withdrawals: false,
    manage_monetization: false,
    manage_team: false,
    manage_settings: false
  }
};

