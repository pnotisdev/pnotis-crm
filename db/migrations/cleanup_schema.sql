DO $$ 
BEGIN
    -- Remove columns from teams if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'teams' AND column_name = 'id_leads_team_id') THEN
        ALTER TABLE teams DROP COLUMN id_leads_team_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'teams' AND column_name = 'id_user_teams_team_id') THEN
        ALTER TABLE teams DROP COLUMN id_user_teams_team_id;
    END IF;

    -- Remove column from users if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'id_user_teams_team_id') THEN
        ALTER TABLE users DROP COLUMN id_user_teams_team_id;
    END IF;

    -- Remove column from contacts if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'contacts' AND column_name = 'id_leads_contact_id') THEN
        ALTER TABLE contacts DROP COLUMN id_leads_contact_id;
    END IF;

    -- Remove columns from leads if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'leads' AND column_name = 'contact') THEN
        ALTER TABLE leads DROP COLUMN contact;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'leads' AND column_name = 'team') THEN
        ALTER TABLE leads DROP COLUMN team;
    END IF;

    -- Add foreign key constraints if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_lead_contact') THEN
        ALTER TABLE leads
        ADD CONSTRAINT fk_lead_contact FOREIGN KEY (contact_id) REFERENCES contacts(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_lead_team') THEN
        ALTER TABLE leads
        ADD CONSTRAINT fk_lead_team FOREIGN KEY (team_id) REFERENCES teams(id);
    END IF;

    -- Update user_teams structure
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_teams' AND column_name = 'user') THEN
        ALTER TABLE user_teams DROP COLUMN "user";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_teams' AND column_name = 'team') THEN
        ALTER TABLE user_teams DROP COLUMN team;
    END IF;

    -- Add missing columns to tasks if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tasks' AND column_name = 'lead_id') THEN
        ALTER TABLE tasks ADD COLUMN lead_id INTEGER REFERENCES leads(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tasks' AND column_name = 'assigned_to') THEN
        ALTER TABLE tasks ADD COLUMN assigned_to INTEGER REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tasks' AND column_name = 'team_id') THEN
        ALTER TABLE tasks ADD COLUMN team_id INTEGER REFERENCES teams(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tasks' AND column_name = 'completed') THEN
        ALTER TABLE tasks ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;

END $$;
