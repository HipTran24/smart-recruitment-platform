import { useEffect, useState, type ReactNode } from "react";

type SettingId =
  | "personal"
  | "password"
  | "sessions"
  | "email"
  | "applications"
  | "interviews"
  | "resume"
  | "visibility"
  | "privacy"
  | "language"
  | "appearance";

type ToggleId = "email" | "applications" | "interviews" | "visibility";
type SelectId = "resume" | "language" | "appearance";
type IconName =
  | "user"
  | "lock"
  | "devices"
  | "mail"
  | "briefcase"
  | "calendar"
  | "file"
  | "eye"
  | "shield"
  | "globe"
  | "sun"
  | "trash";

type SettingItem = {
  id: SettingId | "delete";
  title: string;
  description: string;
  icon: IconName;
  toggleId?: ToggleId;
  selectId?: SelectId;
};

const sections: { title: string; items: SettingItem[] }[] = [
  {
    title: "Account",
    items: [
      {
        id: "personal",
        title: "Personal Information",
        description: "Edit your name, email, phone number, and details.",
        icon: "user",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        id: "password",
        title: "Password & Login",
        description: "Update your password and sign-in credentials.",
        icon: "lock",
      },
      {
        id: "sessions",
        title: "Login Sessions",
        description: "Review and sign out of devices using your account.",
        icon: "devices",
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        id: "email",
        title: "Email Notifications",
        description: "Receive important updates in your inbox.",
        icon: "mail",
        toggleId: "email",
      },
      {
        id: "applications",
        title: "Application Updates",
        description: "Get notified when your application status changes.",
        icon: "briefcase",
        toggleId: "applications",
      },
      {
        id: "interviews",
        title: "Interview Notifications",
        description: "Receive reminders about your interview schedule.",
        icon: "calendar",
        toggleId: "interviews",
      },
    ],
  },
  {
    title: "Profile & Resume",
    items: [
      {
        id: "resume",
        title: "Default Resume",
        description: "Choose the resume used for new applications.",
        icon: "file",
        selectId: "resume",
      },
      {
        id: "visibility",
        title: "Profile Visibility",
        description: "Allow recruiters to discover your profile.",
        icon: "eye",
        toggleId: "visibility",
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        id: "privacy",
        title: "Data & Privacy",
        description: "Review your personal data and privacy choices.",
        icon: "shield",
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        id: "language",
        title: "Language",
        description: "Choose the language used in your workspace.",
        icon: "globe",
        selectId: "language",
      },
      {
        id: "appearance",
        title: "Appearance",
        description: "Choose light, dark, or system appearance.",
        icon: "sun",
        selectId: "appearance",
      },
    ],
  },
  {
    title: "Account Management",
    items: [
      {
        id: "delete",
        title: "Delete Account",
        description: "Permanently remove your candidate account.",
        icon: "trash",
      },
    ],
  },
];

const toggleDefaults: Record<ToggleId, boolean> = {
  email: true,
  applications: true,
  interviews: true,
  visibility: true,
};

const selectDefaults: Record<SelectId, string> = {
  resume: "Harriet_Lawrence_Resume.pdf",
  language: "English",
  appearance: "Light",
};

const selectOptions: Record<SelectId, string[]> = {
  resume: ["Harriet_Lawrence_Resume.pdf", "Product_Design_CV.pdf"],
  language: ["English", "French", "Spanish"],
  appearance: ["Light", "Dark", "System"],
};

type CandidateSettingsProps = { onClose: () => void };

export function CandidateSettings({ onClose }: CandidateSettingsProps) {
  const [toggles, setToggles] = useState(toggleDefaults);
  const [selections, setSelections] = useState(selectDefaults);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [activeSetting, setActiveSetting] = useState<SettingId | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState({
    firstName: "Harriet",
    lastName: "Lawrence",
    email: "harriet.lawrence@example.com",
    phone: "+44 7700 900123",
  });
  const [revokedSessions, setRevokedSessions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("candidate-settings");
      if (saved) {
        const parsed = JSON.parse(saved) as {
          toggles?: Partial<Record<ToggleId, boolean>>;
          selections?: Partial<Record<SelectId, string>>;
        };
        if (parsed.toggles)
          setToggles({ ...toggleDefaults, ...parsed.toggles });
        if (parsed.selections)
          setSelections({ ...selectDefaults, ...parsed.selections });
      }
    } catch {
      setNotice("Saved preferences could not be loaded.");
    } finally {
      setPreferencesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    try {
      localStorage.setItem(
        "candidate-settings",
        JSON.stringify({ toggles, selections }),
      );
    } catch {
      setNotice("Preferences could not be saved on this device.");
    }
  }, [preferencesLoaded, toggles, selections]);

  const updateToggle = (id: ToggleId) => {
    setToggles((current) => ({ ...current, [id]: !current[id] }));
  };

  const updateSelection = (id: SelectId, value: string) => {
    setSelections((current) => ({ ...current, [id]: value }));
  };

  const openSetting = (id: SettingItem["id"]) => {
    setNotice("");
    if (id === "delete") setShowDeleteConfirmation(true);
    else setActiveSetting(id);
  };

  const closeDialogs = () => {
    setActiveSetting(null);
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="fixed inset-0 z-40 min-h-full overflow-y-auto bg-[#F8FAFC] text-[#0F172A] md:static md:z-auto md:min-h-full md:overflow-visible">
      <header className="candidate-header">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-500"
        >
          <span className="hidden sm:inline">Workspace</span>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="hidden sm:inline">Candidate</span>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="truncate font-semibold text-slate-900">
            Settings
          </span>
        </nav>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 md:flex">
            <SearchIcon />
            <span>Search settings...</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 sm:px-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">Live Sync</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            title="Close settings"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-slate-50 hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <CloseIcon />
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage your account and preferences
          </p>
        </div>

        {notice && (
          <p
            role="status"
            className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
          >
            {notice}
          </p>
        )}

        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              aria-labelledby={`section-${section.title}`}
            >
              <h2
                id={`section-${section.title}`}
                className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]"
              >
                {section.title}
              </h2>
              <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                {section.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex min-h-[76px] items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:gap-4 sm:px-5 ${
                      index > 0 ? "border-t border-[#E2E8F0]" : ""
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        item.id === "delete"
                          ? "bg-red-50 text-red-600"
                          : "bg-slate-50 text-[#64748B]"
                      }`}
                    >
                      <SettingIcon name={item.icon} />
                    </span>
                    <button
                      type="button"
                      onClick={() => openSetting(item.id)}
                      className="min-w-0 flex-1 text-left focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <span
                        className={`block text-sm font-semibold ${
                          item.id === "delete"
                            ? "text-red-700"
                            : "text-[#0F172A]"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-[#64748B] sm:text-sm">
                        {item.description}
                      </span>
                    </button>
                    {item.toggleId ? (
                      <Toggle
                        checked={toggles[item.toggleId]}
                        label={item.title}
                        onClick={(event) => {
                          event.stopPropagation();
                          updateToggle(item.toggleId!);
                        }}
                      />
                    ) : item.selectId ? (
                      <select
                        aria-label={item.title}
                        value={selections[item.selectId]}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          updateSelection(item.selectId!, event.target.value)
                        }
                        className="max-w-[150px] rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-2 text-xs text-[#0F172A] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-[220px] sm:text-sm"
                      >
                        {selectOptions[item.selectId].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Open ${item.title} settings`}
                        onClick={() => openSetting(item.id)}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          item.id === "delete"
                            ? "text-red-500 hover:bg-red-50"
                            : "text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        <ChevronIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {activeSetting && (
        <SettingDialog
          setting={activeSetting}
          onClose={closeDialogs}
          toggles={toggles}
          updateToggle={updateToggle}
          selections={selections}
          updateSelection={updateSelection}
          profile={profile}
          setProfile={setProfile}
          revokedSessions={revokedSessions}
          revokeSession={(session) =>
            setRevokedSessions((current) => [...current, session])
          }
          notify={setNotice}
        />
      )}

      {showDeleteConfirmation && (
        <Dialog title="Delete Account" onClose={closeDialogs}>
          <p className="text-sm leading-6 text-[#64748B]">
            Are you sure you want to delete your account?
          </p>
          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeDialogs}
              className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                closeDialogs();
                setNotice(
                  "Account deletion is not connected to an account service yet.",
                );
              }}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

type SettingDialogProps = {
  setting: SettingId;
  onClose: () => void;
  toggles: Record<ToggleId, boolean>;
  updateToggle: (id: ToggleId) => void;
  selections: Record<SelectId, string>;
  updateSelection: (id: SelectId, value: string) => void;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  setProfile: (profile: SettingDialogProps["profile"]) => void;
  revokedSessions: string[];
  revokeSession: (session: string) => void;
  notify: (message: string) => void;
};

function SettingDialog({
  setting,
  onClose,
  toggles,
  updateToggle,
  selections,
  updateSelection,
  profile,
  setProfile,
  revokedSessions,
  revokeSession,
  notify,
}: SettingDialogProps) {
  const title = sections
    .flatMap((section) => section.items)
    .find((item) => item.id === setting)?.title;

  const saveAndClose = (message: string) => {
    notify(message);
    onClose();
  };

  return (
    <Dialog title={title ?? "Settings"} onClose={onClose}>
      {setting === "personal" && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveAndClose("Personal information updated.");
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name">
              <input
                required
                value={profile.firstName}
                onChange={(event) =>
                  setProfile({ ...profile, firstName: event.target.value })
                }
                className={inputClass}
              />
            </FormField>
            <FormField label="Last name">
              <input
                required
                value={profile.lastName}
                onChange={(event) =>
                  setProfile({ ...profile, lastName: event.target.value })
                }
                className={inputClass}
              />
            </FormField>
          </div>
          <FormField label="Email address">
            <input
              required
              type="email"
              value={profile.email}
              onChange={(event) =>
                setProfile({ ...profile, email: event.target.value })
              }
              className={inputClass}
            />
          </FormField>
          <FormField label="Phone number">
            <input
              type="tel"
              value={profile.phone}
              onChange={(event) =>
                setProfile({ ...profile, phone: event.target.value })
              }
              className={inputClass}
            />
          </FormField>
          <DialogActions onCancel={onClose} saveLabel="Save changes" />
        </form>
      )}

      {setting === "password" && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveAndClose(
              "Password updates are not connected to an account service yet.",
            );
          }}
          className="space-y-4"
        >
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            required
            showVisibilityToggle={false}
          />
          <PasswordField
            label="New password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <DialogActions onCancel={onClose} saveLabel="Update password" />
        </form>
      )}

      {setting === "sessions" && (
        <div className="space-y-3">
          {[
            {
              name: "Windows PC",
              detail: "London, UK · This device",
              id: "windows",
            },
            {
              name: "iPhone",
              detail: "London, UK · Last active yesterday",
              id: "iphone",
            },
          ].map((session) => (
            <div
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] p-4"
            >
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  {session.name}
                </p>
                <p className="mt-1 text-xs text-[#64748B]">{session.detail}</p>
              </div>
              {revokedSessions.includes(session.id) ? (
                <span className="text-xs font-medium text-slate-500">
                  Signed out
                </span>
              ) : session.id === "windows" ? (
                <span className="text-xs font-medium text-emerald-700">
                  Current session
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => revokeSession(session.id)}
                  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign out
                </button>
              )}
            </div>
          ))}
          <div className="pt-2">
            <DialogActions onCancel={onClose} cancelLabel="Close" hideSave />
          </div>
        </div>
      )}

      {(setting === "email" ||
        setting === "applications" ||
        setting === "interviews" ||
        setting === "visibility") && (
        <div>
          <p className="mb-5 text-sm leading-6 text-[#64748B]">
            {setting === "visibility"
              ? "Choose whether recruiters can find and view your candidate profile."
              : "You can change this preference at any time."}
          </p>
          <PreferenceToggle
            label={
              setting === "visibility" ? "Visible to recruiters" : "Enabled"
            }
            checked={toggles[setting]}
            onChange={() => updateToggle(setting)}
          />
          <DialogActions
            onCancel={onClose}
            saveLabel="Done"
            onSave={() => saveAndClose("Preference updated.")}
          />
        </div>
      )}

      {setting === "resume" && (
        <div>
          <p className="mb-4 text-sm text-[#64748B]">
            This resume will be selected by default when you apply for a role.
          </p>
          <FormField label="Default resume">
            <select
              value={selections.resume}
              onChange={(event) =>
                updateSelection("resume", event.target.value)
              }
              className={inputClass}
            >
              {selectOptions.resume.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </FormField>
          <DialogActions
            onCancel={onClose}
            saveLabel="Save preference"
            onSave={() => saveAndClose("Default resume updated.")}
          />
        </div>
      )}

      {setting === "privacy" && (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[#64748B]">
            Review how your candidate profile and application information are
            used.
          </p>
          <div className="rounded-lg border border-[#E2E8F0] p-4">
            <p className="text-sm font-semibold text-[#0F172A]">
              Personal data
            </p>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              Your information is used to support applications and recruiter
              communication.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              saveAndClose(
                "Data export is not connected to an account service yet.",
              )
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Request a copy of my data
          </button>
          <DialogActions onCancel={onClose} cancelLabel="Close" hideSave />
        </div>
      )}

      {setting === "language" && (
        <PreferenceSelect
          label="Workspace language"
          value={selections.language}
          options={selectOptions.language}
          onChange={(value) => updateSelection("language", value)}
          onClose={onClose}
          onSave={() => saveAndClose("Language preference updated.")}
        />
      )}

      {setting === "appearance" && (
        <div>
          <p className="mb-4 text-sm text-[#64748B]">
            Select how SmartRecruit should appear.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {selectOptions.appearance.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={selections.appearance === option}
                onClick={() => updateSelection("appearance", option)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  selections.appearance === option
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <DialogActions
            onCancel={onClose}
            saveLabel="Done"
            onSave={() => saveAndClose("Appearance preference updated.")}
          />
        </div>
      )}
    </Dialog>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function PasswordField({
  label,
  autoComplete,
  required = false,
  minLength,
  showVisibilityToggle = true,
}: {
  label: string;
  autoComplete: "current-password" | "new-password";
  required?: boolean;
  minLength?: number;
  showVisibilityToggle?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField label={label}>
      <span className="relative mt-1.5 block">
        <input
          required={required}
          minLength={minLength}
          type={showVisibilityToggle && isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          className={`${inputClass} mt-0 ${showVisibilityToggle ? "pr-11" : ""}`}
        />
        {showVisibilityToggle && (
          <button
            type="button"
            aria-label={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
            aria-pressed={isVisible}
            onClick={() => setIsVisible((visible) => !visible)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PasswordVisibilityIcon visible={isVisible} />
          </button>
        )}
      </span>
    </FormField>
  );
}

function PreferenceSelect({
  label,
  value,
  options,
  onChange,
  onClose,
  onSave,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div>
      <FormField label={label}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </FormField>
      <DialogActions
        onCancel={onClose}
        saveLabel="Save preference"
        onSave={onSave}
      />
    </div>
  );
}

function DialogActions({
  onCancel,
  saveLabel = "Save changes",
  onSave,
  hideSave = false,
  cancelLabel = "Cancel",
}: {
  onCancel: () => void;
  saveLabel?: string;
  onSave?: () => void;
  hideSave?: boolean;
  cancelLabel?: string;
}) {
  return (
    <div className="mt-7 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        {cancelLabel}
      </button>
      {!hideSave && (
        <button
          type={onSave ? "button" : "submit"}
          onClick={onSave}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {saveLabel}
        </button>
      )}
    </div>
  );
}

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-settings-dialog-title"
        className="relative z-10 my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2
            id="candidate-settings-dialog-title"
            className="text-lg font-bold text-[#0F172A]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${
        checked ? "bg-[#2563EB]" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute ${
          checked ? "left-[22px]" : "left-0.5"
        } top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left]`}
      />
    </button>
  );
}

function PreferenceToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-4">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${
          checked ? "bg-[#2563EB]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute ${
            checked ? "left-[22px]" : "left-0.5"
          } top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left]`}
        />
      </button>
    </div>
  );
}

function SettingIcon({ name }: { name: IconName }) {
  const shapes: Record<IconName, ReactNode> = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    lock: (
      <>
        <rect x="4.5" y="10" width="15" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    devices: (
      <>
        <rect x="3" y="4" width="13" height="13" rx="2" />
        <path d="M7 21h5m-2.5-4v4m8-12h3v12h-7v-3" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 5h18m-11 0v2h4v-2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18m-13 4h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8m-8 4h8" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 0 1 0 20m0-20a15 15 0 0 0 0 20" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {shapes[name]}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      {visible ? (
        <circle cx="12" cy="12" r="3" />
      ) : (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="m3 3 18 18" />
        </>
      )}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="h-4 w-4 shrink-0"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
