import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {WorkExperience} from "../../../core/models/WorkExperience";
import {WorkExperienceService} from "../../../core/services/work-experience.service";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {HttpClient, HttpHeaders} from "@angular/common/http";

interface LanguageInfo {
  code: string;
  name: string;
}

interface TranslationRequest {
  text: string;
  targetLanguage: string;
}

@Component({
  selector: 'app-create-work-experience',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './create-work-experience.component.html',
  styleUrl: './create-work-experience.component.css'
})
export class CreateWorkExperienceComponent implements OnInit {
  workExperienceForm!: FormGroup;
  selectedFile: File | null = null;
  submitted = false;
  skills: string[] = []; // Array to hold the skill tags
  translating: boolean = false;

  // Language management
  languages: LanguageInfo[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }
  ];
  currentLanguageIndex = 0;

  // Storage for saved forms
  savedForms: WorkExperience[] = [];

  // Map to store skills for each language
  languageSkillsMap: Map<string, string[]> = new Map();

  // Map to store original English text for translation
  originalEnglishTexts: Map<string, string | string[]> = new Map();

  constructor(
    private workExperienceService: WorkExperienceService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setLanguageCode(this.languages[0].code);
  }

  // Getter for form controls - to use in template for validation
  get f() {
    return this.workExperienceForm.controls;
  }

  // Initialize form with validators
  initForm() {
    this.workExperienceForm = this.fb.group({
      userId: [1, Validators.required], // Hard-coded for example; should come from auth service
      languageCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5)]],
      jobTitle: ['', [Validators.required, Validators.maxLength(255)]],
      companyName: ['', [Validators.required, Validators.maxLength(255)]],
      location: ['', [Validators.required, Validators.maxLength(255)]],
      startDate: ['', Validators.required],
      endDate: [''],
      description: ['', Validators.maxLength(2000)]
      // Skills are handled separately through the skills array
    });
  }

  // Add a skill tag
  addSkill(skill: string) {
    if (skill && skill.trim() !== '' && !this.skills.includes(skill.trim())) {
      this.skills.push(skill.trim());

      // Save skills for current language
      this.saveSkillsForCurrentLanguage();

      // If this is English, save the original skill
      if (this.currentLanguageIndex === 0) {
        const originalSkills = this.originalEnglishTexts.get('skills') as string[] || [];
        originalSkills.push(skill.trim());
        this.originalEnglishTexts.set('skills', originalSkills);
      }
    }
  }

  // Remove a skill tag
  removeSkill(index: number) {
    if (index >= 0 && index < this.skills.length) {
      this.skills.splice(index, 1);

      // Save skills for current language
      this.saveSkillsForCurrentLanguage();
    }
  }

  // Save skills for the current language
  saveSkillsForCurrentLanguage() {
    const currentLangCode = this.languages[this.currentLanguageIndex].code;
    this.languageSkillsMap.set(currentLangCode, [...this.skills]);
  }

  // Load skills for a language
  loadSkillsForLanguage(languageCode: string) {
    const savedSkills = this.languageSkillsMap.get(languageCode) || [];
    this.skills = [...savedSkills];
  }

  // File input handler - only required for English form
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // Handle form submission for current language
  submitCurrentForm() {
    this.submitted = true;

    // Check if form is valid
    if (this.workExperienceForm.invalid) {
      return;
    }

    // For the first form (English), check if the logo is uploaded
    if (this.currentLanguageIndex === 0 && !this.selectedFile) {
      return; // Logo is required for English form
    }

    // Check if at least one skill is added
    if (this.skills.length === 0) {
      return;
    }

    // Create a copy of the form value and add skills
    const formValue = { ...this.workExperienceForm.value } as WorkExperience;
    formValue.skills = [...this.skills];

    // Find if we already have a form saved for this language
    const existingIndex = this.savedForms.findIndex(
      form => form.languageCode === formValue.languageCode
    );

    if (existingIndex >= 0) {
      // Update existing entry
      this.savedForms[existingIndex] = formValue;
    } else {
      // Add new entry
      this.savedForms.push(formValue);
    }

    // If this is English form, store original values for translation
    if (this.currentLanguageIndex === 0) {
      this.originalEnglishTexts.set('jobTitle', formValue.jobTitle);
      this.originalEnglishTexts.set('companyName', formValue.companyName);
      this.originalEnglishTexts.set('location', formValue.location);
      this.originalEnglishTexts.set('description', formValue.description ?? '');      this.originalEnglishTexts.set('skills', [...this.skills]);
    }

    // Save skills for current language
    this.saveSkillsForCurrentLanguage();

    // If this is the last language, submit all forms
    if (this.isLastLanguage()) {
      this.submitAllForms();
    } else {
      // Move to next language
      this.nextLanguage();
    }

    this.submitted = false;
  }

  // Translation methods
  translateField(fieldName: string) {
    if (this.currentLanguageIndex === 0) return; // No translation needed for English

    const originalText = this.originalEnglishTexts.get(fieldName) as string;
    if (!originalText) return;

    const targetLanguage = this.languages[this.currentLanguageIndex].code;
    this.translating = true;

    this.http.get<{ translatedText: string }>(
      `http://localhost:8081/api/v1/ai/translate?text=${encodeURIComponent(originalText)}&targetLanguage=${targetLanguage}`
    ).subscribe({
      next: (response) => {
        this.workExperienceForm.patchValue({ [fieldName]: response.translatedText });
        this.translating = false;
      },
      error: (error) => {
        console.error('Translation error:', error);
        alert('Translation failed. Please try again.');
        this.translating = false;
      }
    });
  }



  translateSkills() {
    if (this.currentLanguageIndex === 0) return; // Don't translate English

    const originalSkills = this.originalEnglishTexts.get('skills') as string[];
    if (!originalSkills || originalSkills.length === 0) return;

    const targetLanguage = this.languages[this.currentLanguageIndex].code;
    this.translating = true;

    // Convert skills to a query string format
    const skillsText = originalSkills.join('|||');

    this.http.get<{ translatedText: string }>(
      `http://localhost:8081/api/v1/ai/translate?text=${encodeURIComponent(skillsText)}&targetLanguage=${targetLanguage}`
    ).subscribe(
      (response) => {
        const translatedSkills = response.translatedText.split('|||');
        this.skills = translatedSkills.map(skill => skill.trim()).filter(skill => skill !== '');
        this.saveSkillsForCurrentLanguage();
        this.translating = false;
      },
      (error) => {
        console.error('Skills translation error:', error);
        alert('Skills translation failed. Please try again.');
        this.translating = false;
      }
    );
  }

  translateAllFields() {
    if (this.currentLanguageIndex === 0) return; // Don't translate English

    // Translate each field
    this.translateField('jobTitle');
    this.translateField('companyName');
    this.translateField('location');
    this.translateField('description');
    this.translateSkills();
  }

  // Navigation methods
  nextLanguage() {
    if (this.currentLanguageIndex < this.languages.length - 1) {
      this.currentLanguageIndex++;
      this.loadLanguageForm(this.currentLanguageIndex);
    }
  }

  previousLanguage() {
    if (this.currentLanguageIndex > 0) {
      this.currentLanguageIndex--;
      this.loadLanguageForm(this.currentLanguageIndex);
    }
  }

  // Check if current language is last
  isLastLanguage(): boolean {
    return this.currentLanguageIndex === this.languages.length - 1;
  }

  // Get current language name for display
  getCurrentLanguageName(): string {
    return this.languages[this.currentLanguageIndex].name;
  }

  // Get language name by code
  getLanguageName(code: string): string {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.name : code;
  }

  // Set current language code in form
  setLanguageCode(code: string) {
    this.workExperienceForm.patchValue({ languageCode: code });
  }

  // Load form data for a specific language
  loadLanguageForm(index: number) {
    const languageCode = this.languages[index].code;
    this.setLanguageCode(languageCode);

    // Load skills for this language
    this.loadSkillsForLanguage(languageCode);

    // Check if we have already saved data for this language
    const savedForm = this.savedForms.find(form => form.languageCode === languageCode);

    if (savedForm) {
      // Load saved form data
      this.workExperienceForm.patchValue({
        userId: savedForm.userId,
        languageCode: savedForm.languageCode,
        jobTitle: savedForm.jobTitle,
        companyName: savedForm.companyName,
        location: savedForm.location,
        startDate: savedForm.startDate,
        endDate: savedForm.endDate,
        description: savedForm.description
      });

      // Load skills
      this.skills = savedForm.skills || [];
    } else {
      // Reset form but keep language code and user ID
      const userId = this.workExperienceForm.get('userId')?.value;
      this.workExperienceForm.reset({ userId, languageCode });
    }
  }

  // Edit a previously saved form
  editSavedForm(index: number) {
    const form = this.savedForms[index];
    const langIndex = this.languages.findIndex(lang => lang.code === form.languageCode);

    if (langIndex >= 0) {
      this.currentLanguageIndex = langIndex;
      this.loadLanguageForm(langIndex);
    }
  }

  // Submit all saved forms to the backend
  submitAllForms() {
    if (this.savedForms.length === 0 || !this.selectedFile) {
      return;
    }

    this.workExperienceService.createWorkExperience(this.savedForms, this.selectedFile).subscribe(
      (data) => {
        // Success - clear the form and saved data
        this.savedForms = [];
        this.workExperienceForm.reset();
        this.selectedFile = null;
        this.currentLanguageIndex = 0;
        this.skills = [];
        this.languageSkillsMap.clear();
        this.originalEnglishTexts.clear();
        this.initForm();
        this.setLanguageCode(this.languages[0].code);

        // Show success message
        alert('Work experiences saved successfully!');
      },
      (error) => {
        console.error('Error creating work experiences', error);
        alert('Error saving work experiences. Please try again.');
      }
    );
  }
}
