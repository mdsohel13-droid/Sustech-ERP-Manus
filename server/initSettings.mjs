import { drizzle } from "drizzle-orm/mysql2";
import { systemSettings } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function initializeSettings() {
  console.log("Initializing default system settings...");

  const defaultSettings = [
    {
      settingKey: "defaultCurrency",
      settingValue: "BDT",
      settingType: "string",
      category: "currency",
      description: "Default currency for the system",
      updatedBy: null,
    },
    {
      settingKey: "dateFormat",
      settingValue: "DD/MM/YYYY",
      settingType: "string",
      category: "currency",
      description: "Default date format",
      updatedBy: null,
    },
    {
      settingKey: "timezone",
      settingValue: "Asia/Dhaka",
      settingType: "string",
      category: "currency",
      description: "Default timezone",
      updatedBy: null,
    },
    {
      settingKey: "companyName",
      settingValue: "Sustech Energy Solutions",
      settingType: "string",
      category: "general",
      description: "Company name",
      updatedBy: null,
    },
    {
      settingKey: "themeColor",
      settingValue: "cream",
      settingType: "string",
      category: "theme",
      description: "Theme color scheme",
      updatedBy: null,
    },
    {
      settingKey: "defaultLanguage",
      settingValue: "english",
      settingType: "string",
      category: "language",
      description: "Default system language",
      updatedBy: null,
    },
  ];

  for (const setting of defaultSettings) {
    try {
      const existing = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.settingKey, setting.settingKey))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(systemSettings).values(setting);
        console.log(`✓ Initialized setting: ${setting.settingKey} = ${setting.settingValue}`);
      } else {
        console.log(`- Setting already exists: ${setting.settingKey}`);
      }
    } catch (error) {
      console.error(`✗ Failed to initialize setting ${setting.settingKey}:`, error);
    }
  }

  console.log("Settings initialization complete!");
  process.exit(0);
}

initializeSettings().catch((error) => {
  console.error("Fatal error during settings initialization:", error);
  process.exit(1);
});
