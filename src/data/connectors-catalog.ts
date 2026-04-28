/**
 * Connector catalog used by product workspace.
 * Slugs match Lovable connector IDs where possible (see standard_connectors).
 */

export type ConnectorCatalogItem = {
  slug: string;
  name: string;
  description: string;
  category: 'mail' | 'crm' | 'calendar' | 'payment' | 'docs' | 'comms' | 'automation' | 'voice' | 'other';
  icon: string; // lucide name
};

export const CONNECTOR_CATALOG: ConnectorCatalogItem[] = [
  { slug: 'gmail', name: 'Gmail', description: 'E-Mail lesen & senden', category: 'mail', icon: 'Mail' },
  { slug: 'outlook', name: 'Microsoft Outlook', description: 'E-Mail & Kalender', category: 'mail', icon: 'Mail' },
  { slug: 'google_calendar', name: 'Google Calendar', description: 'Termine erstellen & lesen', category: 'calendar', icon: 'Calendar' },
  { slug: 'hubspot', name: 'HubSpot', description: 'CRM-Synchronisation', category: 'crm', icon: 'Users' },
  { slug: 'pipedrive', name: 'Pipedrive', description: 'Sales-Pipeline', category: 'crm', icon: 'Users' },
  { slug: 'stripe', name: 'Stripe', description: 'Zahlungen & Abos', category: 'payment', icon: 'CreditCard' },
  { slug: 'n8n', name: 'n8n', description: 'Workflow-Automation Backbone', category: 'automation', icon: 'Workflow' },
  { slug: 'whatsapp_business', name: 'WhatsApp Business', description: 'Nachrichten & Chatbot', category: 'comms', icon: 'MessageCircle' },
  { slug: 'sipgate', name: 'sipgate', description: 'Telefonie / Call-Center', category: 'voice', icon: 'PhoneCall' },
  { slug: 'twilio', name: 'Twilio', description: 'SMS & Voice', category: 'voice', icon: 'PhoneCall' },
  { slug: 'google_drive', name: 'Google Drive', description: 'Dateien speichern & lesen', category: 'docs', icon: 'FolderOpen' },
  { slug: 'onedrive', name: 'Microsoft OneDrive', description: 'Dateien speichern', category: 'docs', icon: 'FolderOpen' },
  { slug: 'google_sheets', name: 'Google Sheets', description: 'Daten lesen & schreiben', category: 'docs', icon: 'Table' },
  { slug: 'slack', name: 'Slack', description: 'Team-Benachrichtigungen', category: 'comms', icon: 'MessageSquare' },
  { slug: 'zoom', name: 'Zoom', description: 'Meetings erstellen', category: 'calendar', icon: 'Video' },
  { slug: 'calendly', name: 'Calendly', description: 'Buchungsseiten', category: 'calendar', icon: 'Calendar' },
  { slug: 'datev', name: 'DATEV', description: 'Buchhaltungs-Export', category: 'other', icon: 'Receipt' },
  { slug: 'lexoffice', name: 'lexoffice', description: 'Rechnungen & Buchhaltung', category: 'other', icon: 'Receipt' },
  { slug: 'sevdesk', name: 'sevDesk', description: 'Buchhaltung & Belege', category: 'other', icon: 'Receipt' },
  { slug: 'webhook', name: 'Generischer Webhook', description: 'Beliebige eigene Schnittstelle', category: 'other', icon: 'Webhook' },
];

export function getConnector(slug: string): ConnectorCatalogItem | undefined {
  return CONNECTOR_CATALOG.find((c) => c.slug === slug);
}
