# Supabase setup for GitHub Pages

The portfolio remains a static GitHub Pages site. Supabase provides password authentication and stores editable text and hidden repository IDs. The browser uses only the Supabase anon key; never put a `service_role` key in this project or in GitHub Actions.

## 1. Create the Supabase project

Create a project at Supabase and open its SQL Editor. In `supabase/schema.sql`, replace both occurrences of `REPLACE_WITH_YOUR_LOGIN_EMAIL` with the exact email address you will use to sign in, then run the SQL.

## 2. Create the admin account

In Supabase Authentication, enable the Email provider and create your user from the dashboard. Disable public sign-ups so nobody else can create an account. Use the same email address configured in the SQL policy. The database policy is the actual access control; hiding the admin URL is not security.

## 3. Add GitHub Actions secrets

In the portfolio repository, open **Settings → Secrets and variables → Actions** and add these repository secrets:

- `VITE_SUPABASE_URL`: the Project URL from Supabase API settings.
- `VITE_SUPABASE_ANON_KEY`: the anon/public key from Supabase API settings.
- `VITE_ADMIN_EMAIL`: the email address of the admin account.

The URL, anon key, and admin email are included in the public JavaScript bundle. That is expected: the anon key grants only the permissions allowed by the SQL policies. Do not use the service-role key here.

## 4. Deploy and use the panel

Push a commit to `main` or run the Pages workflow manually. After deployment, open the site's URL with `?admin` appended, for example `https://your-user.github.io/your-repository/?admin`, and sign in with the account created above.

The panel edits the main introduction, project heading and description, and the two paragraphs in the About section. Project visibility only controls whether a repository appears in this portfolio; it does not make the GitHub repository private or remove its direct URL.

Without the Actions secrets, the public portfolio keeps its current default text and project list; the admin panel shows a setup notice.