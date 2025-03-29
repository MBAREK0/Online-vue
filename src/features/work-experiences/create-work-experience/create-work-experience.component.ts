import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { WorkExperienceRequest } from "../../../core/vm/work-experience/WorkExperienceRequest";
import { WorkExperienceService } from "../../../core/services/work-experience.service";
import { CommonModule, NgForOf, NgIf } from "@angular/common";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import { AppState, PortfolioTranslationLanguages } from "../../../shared/state/app.reducer";
import { Store } from "@ngrx/store";
import { selectUserPortfolioLanguages } from "../../../shared/state/app.selectors";
import {animate, style, transition, trigger} from "@angular/animations";

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
  styleUrl: './create-work-experience.component.css',
  animations: [
    trigger('modalState', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class CreateWorkExperienceComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  workExperienceForm!: FormGroup;
  selectedFiles: { [key: string]: File | null } = {};
  submitted = false;
  skills: string[] = [];
  translating: boolean = false;

  languages: PortfolioTranslationLanguages[] = [];
  currentLanguageIndex = 0;
  primaryLanguageIndex = 0;

  savedForms: WorkExperienceRequest[] = [];
  errorMessage: string | null = null;
  isErrorModalVisible = false;

  languageSkillsMap: Map<string, string[]> = new Map();
  originalPrimaryTexts: Map<string, string | string[]> = new Map();

  constructor(
    private workExperienceService: WorkExperienceService,
    private fb: FormBuilder,
    private http: HttpClient,
    private store: Store<AppState>,
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserPortfolioLanguages).subscribe((langs) => {
      if (langs && langs.length > 0) {
        this.languages = langs;
        console.log("langs",langs);

        this.primaryLanguageIndex = this.languages.findIndex(lang => lang.primary);
        if (this.primaryLanguageIndex === -1) {
          this.primaryLanguageIndex = 0;
          this.languages[0].primary = true;
        }

        this.initForm();
        this.currentLanguageIndex = this.primaryLanguageIndex;
        this.loadLanguageForm(this.currentLanguageIndex);
      }
    });
  }

  get f() {
    return this.workExperienceForm.controls;
  }

  initForm() {
    this.workExperienceForm = this.fb.group({
      userId: [this.getUserIdFromStorage(), Validators.required],
      languageCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5)]],
      jobTitle: ['', [Validators.required, Validators.maxLength(255)]],
      companyName: ['', [Validators.required, Validators.maxLength(255)]],
      location: ['', [Validators.required, Validators.maxLength(255)]],
      startDate: ['', Validators.required],
      endDate: [''],
      description: ['', Validators.maxLength(2000)]
    });
  }

  getUserIdFromStorage(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 1;
  }

  onFileChange(event: any) {
    const currentLangCode = this.languages[this.currentLanguageIndex].code;

    if (event.target.files.length > 0) {
      this.selectedFiles[currentLangCode] = event.target.files[0];
    } else {
      delete this.selectedFiles[currentLangCode];
    }
  }

  addSkill(skill: string) {
    if (skill && skill.trim() !== '' && !this.skills.includes(skill.trim())) {
      this.skills.push(skill.trim());
      this.saveSkillsForCurrentLanguage();

      if (this.currentLanguageIndex === this.primaryLanguageIndex) {
        const originalSkills = this.originalPrimaryTexts.get('skills') as string[] || [];
        originalSkills.push(skill.trim());
        this.originalPrimaryTexts.set('skills', originalSkills);
      }
    }
  }

  removeSkill(index: number) {
    if (index >= 0 && index < this.skills.length) {
      this.skills.splice(index, 1);
      this.saveSkillsForCurrentLanguage();
    }
  }

  saveSkillsForCurrentLanguage() {
    const currentLangCode = this.languages[this.currentLanguageIndex].code;
    this.languageSkillsMap.set(currentLangCode, [...this.skills]);
  }

  loadSkillsForLanguage(languageCode: string) {
    const savedSkills = this.languageSkillsMap.get(languageCode) || [];
    this.skills = [...savedSkills];
  }

  submitCurrentForm() {
    this.submitted = true;

    // For non-primary languages, patch start date, end date, and company name from primary language form
    if (this.currentLanguageIndex !== this.primaryLanguageIndex) {
      const primaryForm = this.savedForms.find(form =>
        form.languageCode === this.languages[this.primaryLanguageIndex].code
      );

      if (primaryForm) {
        this.workExperienceForm.patchValue({
          companyName: primaryForm.companyName,
          startDate: primaryForm.startDate,
          endDate: primaryForm.endDate
        });
      }
    }

    if (this.workExperienceForm.invalid || this.skills.length === 0) {
      return;
    }

    const currentLangCode = this.languages[this.currentLanguageIndex].code;
    if (this.currentLanguageIndex === this.primaryLanguageIndex && !this.selectedFiles[currentLangCode]) {
      alert('Please upload a company logo for the primary language.');
      return;
    }

    // For all languages, keep form values as they are
    const formValue = {
      ...this.workExperienceForm.value,
      skills: [...this.skills]
    } as WorkExperienceRequest;

    const existingIndex = this.savedForms.findIndex(
      form => form.languageCode === formValue.languageCode
    );

    if (existingIndex >= 0) {
      this.savedForms[existingIndex] = formValue;
    } else {
      this.savedForms.push(formValue);
    }

    if (this.currentLanguageIndex === this.primaryLanguageIndex) {
      this.originalPrimaryTexts.set('jobTitle', formValue.jobTitle);
      this.originalPrimaryTexts.set('location', formValue.location);
      this.originalPrimaryTexts.set('description', formValue.description ?? '');
      this.originalPrimaryTexts.set('skills', [...this.skills]);
      this.originalPrimaryTexts.set('companyName', formValue.companyName);
    }

    this.saveSkillsForCurrentLanguage();

    if (this.isLastLanguage()) {
      this.submitAllForms();
    } else {
      this.nextLanguage();
    }

    this.submitted = false;
  }

  submitAllForms() {
    if (this.savedForms.length === 0) {
      return;
    }

    const primaryLangCode = this.languages[this.primaryLanguageIndex].code;
    const logoFile = this.selectedFiles[primaryLangCode];

    if (!logoFile) {
      this.showErrorModal('Please upload a company logo.');
      return;
    }

    this.workExperienceService.createWorkExperience(this.savedForms, logoFile).subscribe({
      next: () => {
        this.savedForms = [];
        this.workExperienceForm.reset();
        this.selectedFiles = {};
        this.currentLanguageIndex = this.primaryLanguageIndex;
        this.skills = [];
        this.languageSkillsMap.clear();
        this.originalPrimaryTexts.clear();
        this.initForm();
        this.loadLanguageForm(this.primaryLanguageIndex);

        this.showErrorModal('Work experiences saved successfully!', true);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating work experiences', error);

        // Handle different types of error responses
        let errorMsg = 'Error saving work experiences. Please try again.';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMsg = error.error.message;
        } else if (error.status) {
          // Server-side error with status code
          switch (error.status) {
            case 400:
              errorMsg = error.error?.message || 'Invalid data. Please check your inputs.';
              break;
            case 401:
              errorMsg = 'Unauthorized. Please log in again.';
              break;
            case 403:
              errorMsg = 'You do not have permission to perform this action.';
              break;
            case 404:
              errorMsg = 'Service not found. Please contact support.';
              break;
            case 500:
              errorMsg = 'Server error. Please try again later.';
              break;
            default:
              errorMsg = error.error?.message || 'An unexpected error occurred.';
          }
        }

        this.showErrorModal(errorMsg);
      }
    });
  }

  loadLanguageForm(index: number) {
    const languageCode = this.languages[index].code;
    this.setLanguageCode(languageCode);

    this.loadSkillsForLanguage(languageCode);

    const savedForm = this.savedForms.find(form => form.languageCode === languageCode);

    if (savedForm) {
      this.workExperienceForm.patchValue({
        userId: this.getUserIdFromStorage(),
        languageCode: savedForm.languageCode,
        jobTitle: savedForm.jobTitle,
        companyName: savedForm.companyName,
        location: savedForm.location,
        startDate: savedForm.startDate,
        endDate: savedForm.endDate,
        description: savedForm.description
      });

      this.skills = savedForm.skills || [];
    } else {
      this.workExperienceForm.reset({
        userId: this.getUserIdFromStorage(),
        languageCode: languageCode
      });
      this.skills = [];
    }

    if (this.selectedFiles[languageCode]) {
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

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

  isLastLanguage(): boolean {
    return this.currentLanguageIndex === this.languages.length - 1;
  }

  getCurrentLanguageName(): string {
    return this.languages[this.currentLanguageIndex].language;
  }

  getLanguageName(code: string): string {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.language : code;
  }

  setLanguageCode(code: string) {
    this.workExperienceForm.patchValue({ languageCode: code });
  }

  editSavedForm(index: number) {
    const form = this.savedForms[index];
    const langIndex = this.languages.findIndex(lang => lang.code === form.languageCode);

    if (langIndex >= 0) {
      this.currentLanguageIndex = langIndex;
      this.loadLanguageForm(langIndex);
    }
  }

  // ----------------------- error modal methods
  showErrorModal(message: string, isSuccess: boolean = false) {
    this.errorMessage = message;
    this.isErrorModalVisible = true;

    // Automatically hide success messages after 3 seconds
    if (isSuccess) {
      setTimeout(() => {
        this.isErrorModalVisible = false;
        this.errorMessage = null;
      }, 3000);
    }
  }

  closeErrorModal() {
    this.isErrorModalVisible = false;
    this.errorMessage = null;
  }

  // ----------------------- translation methods
  translateField(fieldName: string) {
    const nonTranslatableFields = ['companyName', 'startDate', 'endDate'];
    if (nonTranslatableFields.includes(fieldName)) return;

    if (this.currentLanguageIndex === this.primaryLanguageIndex) return;

    const originalText = this.originalPrimaryTexts.get(fieldName) as string;
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
    if (this.currentLanguageIndex === this.primaryLanguageIndex) return;

    const originalSkills = this.originalPrimaryTexts.get('skills') as string[];
    if (!originalSkills || originalSkills.length === 0) return;

    const targetLanguage = this.languages[this.currentLanguageIndex].code;
    this.translating = true;

    const skillsText = originalSkills.join('|||');

    this.http.get<{ translatedText: string }>(
      `http://localhost:8081/api/v1/ai/translate?text=${encodeURIComponent(skillsText)}&targetLanguage=${targetLanguage}`
    ).subscribe({
      next: (response) => {
        const translatedSkills = response.translatedText.split('|||');
        this.skills = translatedSkills.map(skill => skill.trim()).filter(skill => skill !== '');
        this.saveSkillsForCurrentLanguage();
        this.translating = false;
      },
      error: (error) => {
        console.error('Skills translation error:', error);
        alert('Skills translation failed. Please try again.');
        this.translating = false;
      }
    });
  }

  translateAllFields() {
    if (this.currentLanguageIndex === this.primaryLanguageIndex) return;

    this.translateField('jobTitle');
    this.translateField('location');
    this.translateField('description');
    this.translateSkills();
  }
}
