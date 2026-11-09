# Supabase setup for GitHub Pages

The portfolio remains a static GitHub Pages site. Supabase provides password authentication and stores the editable site document and hidden repository IDs. The browser uses only the Supabase publishable/anon key; never put a `service_role` or secret key in this project or in GitHub Actions.

## 1. Create or update the database

In Supabase, open the project's SQL Editor. In `supabase/schema.sql`, make sure both admin policies contain the exact email address you use to sign in, then run the whole SQL file.

If you already ran an earlier version, run the updated file again. It creates the `site_config` table needed by the complete editor and safely keeps the existing content and hidden-project tables. It also reapplies the row-level security policies for the admin email.

## 2. Create the admin account

In Supabase Authentication, create your user from the dashboard. Disable public sign-ups so nobody else can create an account. Use the same email address configured in the SQL policy. The database policy is the actual access control; hiding the admin URL is not security.

## 3. Add GitHub Actions secrets

In the portfolio repository, open **Settings → Secrets and variables → Actions** and add these repository secrets:

- `VITE_SUPABASE_URL`: the Project URL from Supabase, or `https://PROJECT_ID.supabase.co`.
- `VITE_SUPABASE_ANON_KEY`: the Supabase publishable/anon key. Never use a secret or service-role key.
- `VITE_ADMIN_EMAIL`: the email address of the admin account.

The URL, publishable key, and admin email are included in the public JavaScript bundle. That is expected: the publishable key grants only the permissions allowed by the SQL policies.

## 4. Deploy and use the panel

Push a commit to `main` or run the Pages workflow manually. After deployment, open the site's URL with `?admin` appended, for example `https://your-user.github.io/your-repository/?admin`, and sign in with the account created above.

The panel edits public text, links, image URLs, section visibility, About tags and interactive cards, project-card overrides, and repository visibility. Image and destination URLs are restricted to HTTPS by the app. Project visibility only controls whether a repository appears in this portfolio; it does not make the GitHub repository private or remove its direct URL.

The portfolio renders edited text as React text, not raw HTML. Database writes remain restricted by row-level security to the configured admin email; the public client key is not an admin credential.