

# KRS Signature CRM + Mitgliederbereich - Implementierungsplan

## Aktuelle Situation

**Bereits vorhanden:**
- `profiles` Tabelle mit user_id, full_name, avatar_url
- `user_roles` Tabelle mit Rollen-Zuordnung
- `app_role` Enum: admin, moderator, user
- `has_role()` Security Definer Funktion
- Grundlegende RLS Policies

**Erforderlich:**
- Erweitertes Rollenmodell (5 spezifische CRM-Rollen)
- Authentication Flow (Login/Signup)
- Geschütztes App-Layout mit Navigation
- Rollenbasiertes Routing

---

## Phase 1: Datenbank-Erweiterung

### 1.1 Rollenmodell erweitern

Das bestehende `app_role` Enum muss um die CRM-spezifischen Rollen erweitert werden:

```text
Neue Rollen:
- kunde      (Member/Endkunde)
- mitarbeiter (Sales/Setter/Support)
- teamleiter  (Team-Verantwortlicher)
- geschaeftsfuehrung (Management)
- admin       (bereits vorhanden)
```

### 1.2 Profiles-Tabelle erweitern

Zusätzliche Felder für das CRM:
- `first_name` (Text)
- `last_name` (Text) 
- `email` (Text)
- `phone` (Text, optional)
- `company` (Text, optional)
- `assigned_to` (UUID, für Lead-Zuweisung)

### 1.3 RLS Policies aktualisieren

Hierarchisches Berechtigungskonzept:

```text
Admin           → Vollzugriff auf alles
Geschäftsführung → Lesen fast alles, schreiben KPIs/Notizen
Teamleiter      → Lesen Team-Daten, schreiben Aufgaben
Mitarbeiter     → Nur eigene zugewiesene Leads/Kunden
Kunde           → Nur eigenes Profil und Fortschritt
```

---

## Phase 2: Authentication System

### 2.1 Auth-Seite erstellen

Neue Route `/auth` mit:
- Email/Password Login
- Registrierung (Default-Rolle: kunde)
- Password Reset Flow
- Redirect nach Login ins Dashboard

### 2.2 Auth Context/Hook

```text
useAuth Hook:
- user (aktueller Benutzer)
- session (Supabase Session)
- profile (erweitertes Profil)
- roles (Array der Benutzerrollen)
- hasRole(role) (Prüfung)
- signIn/signUp/signOut Funktionen
```

### 2.3 Auto-Profil bei Registrierung

Trigger `handle_new_user()` erweitern:
- Profil mit Standardwerten anlegen
- Default-Rolle "kunde" zuweisen

---

## Phase 3: App-Layout & Navigation

### 3.1 Zwei-Spalten-Layout

```text
┌─────────────────────────────────────────────────────┐
│                     Header                          │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   Sidebar    │         Main Content                 │
│   (Links)    │         (Rollenabhängig)            │
│              │                                      │
│   - Dashboard│                                      │
│   - CRM      │                                      │
│   - Kunden   │                                      │
│   - Aufgaben │                                      │
│   - Reports  │                                      │
│   - Settings │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### 3.2 Rollenabhängige Navigation

| Menüpunkt | Kunde | Mitarbeiter | Teamleiter | GF | Admin |
|-----------|-------|-------------|------------|-----|-------|
| Dashboard | Eigenes | Team | Team | Übersicht | Alle |
| Kurse/LMS | Ja | - | - | - | Ja |
| Leads | - | Zugewiesene | Team | Alle | Alle |
| Kunden | - | Zugewiesene | Team | Alle | Alle |
| Aufgaben | Eigene | Eigene | Team | Alle | Alle |
| Reports | Eigene KPIs | - | Team | Alle | Alle |
| Einstellungen | Profil | Profil | Team | Erweitert | Voll |
| Admin | - | - | - | - | Ja |

---

## Phase 4: Geschützte Routen

### 4.1 Route-Struktur

```text
Öffentlich (Landing):
/          → Home (Auswahl Start/Growth)
/start     → Landing Signature Start
/growth    → Landing Signature Growth

Geschützt (App):
/app                → Dashboard (rollenabhängig)
/app/crm            → CRM Übersicht
/app/leads          → Lead-Management
/app/customers      → Kundenverwaltung
/app/tasks          → Aufgaben
/app/courses        → LMS/Kurse (nur Kunde)
/app/reports        → Reports/KPIs
/app/settings       → Einstellungen
/app/admin          → Admin-Bereich (nur Admin)
```

### 4.2 ProtectedRoute Komponente

Prüft:
- Ist User eingeloggt?
- Hat User die erforderliche Rolle?
- Redirect zu /auth oder /app/unauthorized

---

## Phase 5: Vorbereitung LMS/Memberbereich

### 5.1 Tabellen-Struktur (Migration vorbereiten)

```text
courses
├── id
├── title
├── description
├── thumbnail_url
├── status (draft/published)
└── created_at

modules
├── id
├── course_id → courses
├── title
├── order_index
└── created_at

lessons
├── id
├── module_id → modules
├── title
├── content_type (video/text/quiz)
├── content_url
├── duration_minutes
├── order_index
└── created_at

course_enrollments
├── id
├── user_id → profiles
├── course_id → courses
├── enrolled_at
└── status

lesson_progress
├── id
├── user_id → profiles
├── lesson_id → lessons
├── completed
├── completed_at
└── progress_percent
```

---

## Zu erstellende Dateien

### Neue Dateien:

```text
src/
├── contexts/
│   └── AuthContext.tsx           (Auth State Management)
├── hooks/
│   └── useAuth.ts                (Auth Hook)
├── pages/
│   ├── Auth.tsx                  (Login/Signup)
│   └── app/
│       ├── Dashboard.tsx         (Rollenabhängiges Dashboard)
│       ├── CRM.tsx               (CRM Übersicht)
│       ├── Leads.tsx             (Lead-Management)
│       ├── Customers.tsx         (Kundenverwaltung)
│       ├── Tasks.tsx             (Aufgaben)
│       ├── Courses.tsx           (LMS - Placeholder)
│       ├── Reports.tsx           (Reports/KPIs)
│       ├── Settings.tsx          (Einstellungen)
│       └── Admin.tsx             (Admin-Panel)
├── components/
│   ├── app/
│   │   ├── AppLayout.tsx         (Sidebar + Content)
│   │   ├── AppSidebar.tsx        (Navigations-Sidebar)
│   │   ├── RoleGuard.tsx         (Rollenprüfung)
│   │   └── UserMenu.tsx          (Avatar + Dropdown)
│   └── ProtectedRoute.tsx        (Route-Schutz)
└── lib/
    └── roles.ts                  (Rollen-Hilfsfunktionen)
```

### Zu ändernde Dateien:

```text
src/App.tsx                       (Neue Routen hinzufügen)
supabase/migrations/              (Neue Migration)
```

---

## Nächste Schritte nach Implementierung

1. **Formular testen**: Login/Signup durchspielen
2. **Admin-User erstellen**: Ersten Admin-User in Supabase anlegen
3. **Rollen testen**: Verschiedene Rollen durchspielen
4. **LMS-Tabellen**: Bei Bedarf Kurs-Struktur aktivieren

---

## Technische Details

### Migration SQL (Beispiel):

```sql
-- 1. Enum erweitern
ALTER TYPE app_role ADD VALUE 'kunde';
ALTER TYPE app_role ADD VALUE 'mitarbeiter';
ALTER TYPE app_role ADD VALUE 'teamleiter';
ALTER TYPE app_role ADD VALUE 'geschaeftsfuehrung';

-- 2. Profiles erweitern
ALTER TABLE profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN company TEXT,
ADD COLUMN assigned_to UUID REFERENCES profiles(id);

-- 3. Default-Rolle für neue User
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.user_id, 'kunde');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Hierarchische has_role Funktion (optional erweitert)
```

### Rollen-Hierarchie im Code:

```typescript
const roleHierarchy = {
  admin: 5,
  geschaeftsfuehrung: 4,
  teamleiter: 3,
  mitarbeiter: 2,
  kunde: 1,
};

// Prüfung: Hat User mindestens diese Rolle?
const hasMinRole = (userRole, requiredRole) => 
  roleHierarchy[userRole] >= roleHierarchy[requiredRole];
```

