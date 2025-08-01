/**
 * Manual Override Interface
 * 
 * This component provides UI for reviewing uncertain placements,
 * drag-and-drop interface for data reorganization, and suggestion system
 * for alternative placements with validation feedback.
 */

import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Move, 
  Edit3, 
  Save, 
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { UncertainField, PlacementAlternative } from '../services/ConfidenceScoringSystem';
import { WorkExperience, Education, ContactInfo } from '../types';

export interface DataItem {
  id: string;
  type: 'contact' | 'experience' | 'education' | 'skills' | 'other';
  field: string;
  value: any;
  originalValue: any;
  confidence: number;
  section: string;
  isEdited: boolean;
  suggestions?: string[];
  warnings?: string[];
}

export interface SectionData {
  id: string;
  name: string;
  type: 'contact' | 'experience' | 'education' | 'skills' | 'other';
  items: DataItem[];
  confidence: number;
  isCollapsed: boolean;
}

export interface ManualOverrideProps {
  uncertainFields: UncertainField[];
  extractedData: {
    contact?: ContactInfo;
    experience?: WorkExperience[];
    education?: Education;
    skills?: string[];
  };
  onDataUpdate: (updatedData: any) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const ManualOverrideInterface: React.FC<ManualOverrideProps> = ({
  uncertainFields,
  extractedData,
  onDataUpdate,
  onConfirm,
  onCancel,
  isVisible
}) => {
  const [sections, setSections] = useState<SectionData[]>(() => 
    initializeSections(extractedData, uncertainFields)
  );
  const [activeTab, setActiveTab] = useState<string>('review');
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const dragEndRef = useRef<boolean>(false);

  // Initialize sections from extracted data
  function initializeSections(
    data: ManualOverrideProps['extractedData'], 
    uncertainFields: UncertainField[]
  ): SectionData[] {
    const sections: SectionData[] = [];
    
    // Contact section
    if (data.contact) {
      const contactItems = createContactItems(data.contact, uncertainFields);
      sections.push({
        id: 'contact',
        name: 'Contact Information',
        type: 'contact',
        items: contactItems,
        confidence: calculateSectionConfidence(contactItems),
        isCollapsed: false
      });
    }
    
    // Experience section
    if (data.experience && data.experience.length > 0) {
      const experienceItems = createExperienceItems(data.experience, uncertainFields);
      sections.push({
        id: 'experience',
        name: 'Work Experience',
        type: 'experience',
        items: experienceItems,
        confidence: calculateSectionConfidence(experienceItems),
        isCollapsed: false
      });
    }
    
    // Education section
    if (data.education) {
      const educationItems = createEducationItems(data.education, uncertainFields);
      sections.push({
        id: 'education',
        name: 'Education',
        type: 'education',
        items: educationItems,
        confidence: calculateSectionConfidence(educationItems),
        isCollapsed: false
      });
    }
    
    // Skills section
    if (data.skills && data.skills.length > 0) {
      const skillsItems = createSkillsItems(data.skills, uncertainFields);
      sections.push({
        id: 'skills',
        name: 'Skills',
        type: 'skills',
        items: skillsItems,
        confidence: calculateSectionConfidence(skillsItems),
        isCollapsed: false
      });
    }
    
    return sections;
  }

  // Handle drag and drop
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same section
      const sectionIndex = sections.findIndex(s => s.id === source.droppableId);
      if (sectionIndex === -1) return;
      
      const newSections = [...sections];
      const section = newSections[sectionIndex];
      const newItems = Array.from(section.items);
      const [reorderedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedItem);
      
      newSections[sectionIndex] = { ...section, items: newItems };
      setSections(newSections);
    } else {
      // Moving between sections
      const sourceSectionIndex = sections.findIndex(s => s.id === source.droppableId);
      const destSectionIndex = sections.findIndex(s => s.id === destination.droppableId);
      
      if (sourceSectionIndex === -1 || destSectionIndex === -1) return;
      
      const newSections = [...sections];
      const sourceSection = newSections[sourceSectionIndex];
      const destSection = newSections[destSectionIndex];
      
      const sourceItems = Array.from(sourceSection.items);
      const destItems = Array.from(destSection.items);
      
      const [movedItem] = sourceItems.splice(source.index, 1);
      movedItem.section = destination.droppableId;
      movedItem.isEdited = true;
      
      destItems.splice(destination.index, 0, movedItem);
      
      newSections[sourceSectionIndex] = { ...sourceSection, items: sourceItems };
      newSections[destSectionIndex] = { ...destSection, items: destItems };
      
      setSections(newSections);
    }
    
    setHasUnsavedChanges(true);
    dragEndRef.current = true;
  }, [sections]);

  // Handle item editing
  const handleItemEdit = useCallback((sectionId: string, itemId: string, newValue: any) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              items: section.items.map(item => 
                item.id === itemId 
                  ? { ...item, value: newValue, isEdited: true }
                  : item
              )
            }
          : section
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  // Handle item reset
  const handleItemReset = useCallback((sectionId: string, itemId: string) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              items: section.items.map(item => 
                item.id === itemId 
                  ? { ...item, value: item.originalValue, isEdited: false }
                  : item
              )
            }
          : section
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  // Handle section collapse/expand
  const handleSectionToggle = useCallback((sectionId: string) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? { ...section, isCollapsed: !section.isCollapsed }
          : section
      )
    );
  }, []);

  // Save changes
  const handleSave = useCallback(() => {
    const updatedData = convertSectionsToData(sections);
    onDataUpdate(updatedData);
    setHasUnsavedChanges(false);
  }, [sections, onDataUpdate]);

  // Get confidence badge color
  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" | "outline" => {
    if (confidence >= 0.8) return "default";
    if (confidence >= 0.6) return "secondary";
    if (confidence >= 0.4) return "outline";
    return "destructive";
  };

  // Get confidence text
  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Good";
    if (confidence >= 0.4) return "Low";
    return "Very Low";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review Extracted Data</h2>
              <p className="text-gray-600 mt-1">
                Review and correct uncertain data before finalizing your resume
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="review">Review Data</TabsTrigger>
                <TabsTrigger value="organize">Organize Sections</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>
            </div>

            <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
              <TabsContent value="review" className="mt-4">
                <ReviewDataTab 
                  sections={sections}
                  onItemEdit={handleItemEdit}
                  onItemReset={handleItemReset}
                  onSectionToggle={handleSectionToggle}
                  getConfidenceBadgeVariant={getConfidenceBadgeVariant}
                  getConfidenceText={getConfidenceText}
                />
              </TabsContent>

              <TabsContent value="organize" className="mt-4">
                <OrganizeSectionsTab 
                  sections={sections}
                  onDragEnd={handleDragEnd}
                  getConfidenceBadgeVariant={getConfidenceBadgeVariant}
                  getConfidenceText={getConfidenceText}
                />
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4">
                <SuggestionsTab 
                  uncertainFields={uncertainFields}
                  sections={sections}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {uncertainFields.length > 0 && (
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  {uncertainFields.length} field{uncertainFields.length !== 1 ? 's' : ''} need{uncertainFields.length === 1 ? 's' : ''} review
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {hasUnsavedChanges && (
                <Button variant="outline" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              )}
              <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm & Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Data Tab Component
const ReviewDataTab: React.FC<{
  sections: SectionData[];
  onItemEdit: (sectionId: string, itemId: string, newValue: any) => void;
  onItemReset: (sectionId: string, itemId: string) => void;
  onSectionToggle: (sectionId: string) => void;
  getConfidenceBadgeVariant: (confidence: number) => "default" | "secondary" | "destructive" | "outline";
  getConfidenceText: (confidence: number) => string;
}> = ({ 
  sections, 
  onItemEdit, 
  onItemReset, 
  onSectionToggle,
  getConfidenceBadgeVariant,
  getConfidenceText 
}) => (
  <div className="space-y-4">
    {sections.map(section => (
      <Card key={section.id} className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{section.name}</CardTitle>
              <Badge variant={getConfidenceBadgeVariant(section.confidence)}>
                {getConfidenceText(section.confidence)} Confidence
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSectionToggle(section.id)}
            >
              {section.isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        
        {!section.isCollapsed && (
          <CardContent>
            <div className="space-y-3">
              {section.items.map(item => (
                <DataItemEditor
                  key={item.id}
                  item={item}
                  onEdit={(newValue) => onItemEdit(section.id, item.id, newValue)}
                  onReset={() => onItemReset(section.id, item.id)}
                />
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    ))}
  </div>
);

// Organize Sections Tab Component
const OrganizeSectionsTab: React.FC<{
  sections: SectionData[];
  onDragEnd: (result: DropResult) => void;
  getConfidenceBadgeVariant: (confidence: number) => "default" | "secondary" | "destructive" | "outline";
  getConfidenceText: (confidence: number) => string;
}> = ({ sections, onDragEnd, getConfidenceBadgeVariant, getConfidenceText }) => (
  <div>
    <Alert className="mb-4">
      <Move className="w-4 h-4" />
      <AlertDescription>
        Drag and drop items between sections to reorganize your resume data. 
        Items with low confidence may need to be moved to the correct section.
      </AlertDescription>
    </Alert>
    
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(section => (
          <Card key={section.id} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{section.name}</CardTitle>
                <Badge variant={getConfidenceBadgeVariant(section.confidence)}>
                  {getConfidenceText(section.confidence)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[100px] p-2 rounded-md border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    {section.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 bg-white border rounded-md shadow-sm transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                            } ${item.isEdited ? 'border-orange-300 bg-orange-50' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">
                                  {item.field}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  {typeof item.value === 'string' 
                                    ? item.value.substring(0, 50) + (item.value.length > 50 ? '...' : '')
                                    : JSON.stringify(item.value).substring(0, 50)
                                  }
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge 
                                  variant={getConfidenceBadgeVariant(item.confidence)}
                                  className="text-xs"
                                >
                                  {Math.round(item.confidence * 100)}%
                                </Badge>
                                <Move className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        ))}
      </div>
    </DragDropContext>
  </div>
);

// Suggestions Tab Component
const SuggestionsTab: React.FC<{
  uncertainFields: UncertainField[];
  sections: SectionData[];
}> = ({ uncertainFields, sections }) => (
  <div className="space-y-4">
    <Alert>
      <AlertTriangle className="w-4 h-4" />
      <AlertDescription>
        Review these suggestions to improve the accuracy of your resume data.
      </AlertDescription>
    </Alert>
    
    {uncertainFields.map((field, index) => (
      <Card key={index} className="border-l-4 border-l-orange-500">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-orange-600">
                  {field.section}
                </Badge>
                <Badge variant={field.confidence < 0.3 ? "destructive" : "outline"}>
                  {Math.round(field.confidence * 100)}% confidence
                </Badge>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">
                {field.field}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {field.reason}
              </p>
              <p className="text-sm text-blue-600">
                💡 {field.suggestion}
              </p>
              {field.alternatives && field.alternatives.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Alternatives:</p>
                  <div className="flex flex-wrap gap-1">
                    {field.alternatives.map((alt, altIndex) => (
                      <Badge key={altIndex} variant="secondary" className="text-xs">
                        {alt}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
    
    {uncertainFields.length === 0 && (
      <Card>
        <CardContent className="pt-4">
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              All data looks good!
            </h3>
            <p className="text-gray-600">
              No uncertain fields detected. Your resume data appears to be accurate.
            </p>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Data Item Editor Component
const DataItemEditor: React.FC<{
  item: DataItem;
  onEdit: (newValue: any) => void;
  onReset: () => void;
}> = ({ item, onEdit, onReset }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.value);

  const handleSave = () => {
    onEdit(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(item.value);
    setIsEditing(false);
  };

  return (
    <div className={`p-3 border rounded-md ${item.isEdited ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Label className="font-medium text-sm">{item.field}</Label>
          <Badge 
            variant={item.confidence < 0.5 ? "destructive" : item.confidence < 0.7 ? "outline" : "default"}
            className="text-xs"
          >
            {Math.round(item.confidence * 100)}%
          </Badge>
          {item.isEdited && (
            <Badge variant="outline" className="text-xs text-orange-600">
              Modified
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                <XCircle className="w-3 h-3" />
              </Button>
            </>
          )}
          {item.isEdited && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              title="Reset to original"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {!isEditing ? (
        <div className="text-sm text-gray-700">
          {typeof item.value === 'string' 
            ? item.value 
            : JSON.stringify(item.value, null, 2)
          }
        </div>
      ) : (
        <div className="space-y-2">
          {typeof item.value === 'string' && item.value.length > 100 ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-sm"
              rows={3}
            />
          ) : (
            <Input
              value={typeof editValue === 'string' ? editValue : JSON.stringify(editValue)}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-sm"
            />
          )}
        </div>
      )}
      
      {item.warnings && item.warnings.length > 0 && (
        <div className="mt-2">
          {item.warnings.map((warning, index) => (
            <Alert key={index} className="py-2">
              <AlertTriangle className="w-3 h-3" />
              <AlertDescription className="text-xs">
                {warning}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
      
      {item.suggestions && item.suggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
          <div className="flex flex-wrap gap-1">
            {item.suggestions.map((suggestion, index) => (
              <Badge key={index} variant="secondary" className="text-xs cursor-pointer"
                onClick={() => onEdit(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function createContactItems(contact: ContactInfo, uncertainFields: UncertainField[]): DataItem[] {
  const items: DataItem[] = [];
  
  Object.entries(contact).forEach(([field, value]) => {
    if (value) {
      const uncertainField = uncertainFields.find(f => f.section === 'contact' && f.field === field);
      items.push({
        id: `contact-${field}`,
        type: 'contact',
        field: field.charAt(0).toUpperCase() + field.slice(1),
        value,
        originalValue: value,
        confidence: uncertainField?.confidence || 0.8,
        section: 'contact',
        isEdited: false,
        warnings: uncertainField ? [uncertainField.reason] : undefined,
        suggestions: uncertainField?.alternatives
      });
    }
  });
  
  return items;
}

function createExperienceItems(experiences: WorkExperience[], uncertainFields: UncertainField[]): DataItem[] {
  const items: DataItem[] = [];
  
  experiences.forEach((exp, index) => {
    const expFields = [
      { key: 'jobTitle', label: 'Job Title' },
      { key: 'employer', label: 'Employer' },
      { key: 'location', label: 'Location' },
      { key: 'accomplishments', label: 'Accomplishments' }
    ];
    
    expFields.forEach(({ key, label }) => {
      const value = exp[key as keyof WorkExperience];
      if (value) {
        const uncertainField = uncertainFields.find(f => f.section === 'experience' && f.field === key);
        items.push({
          id: `experience-${index}-${key}`,
          type: 'experience',
          field: `${label} (Job ${index + 1})`,
          value,
          originalValue: value,
          confidence: uncertainField?.confidence || 0.7,
          section: 'experience',
          isEdited: false,
          warnings: uncertainField ? [uncertainField.reason] : undefined,
          suggestions: uncertainField?.alternatives
        });
      }
    });
  });
  
  return items;
}

function createEducationItems(education: Education, uncertainFields: UncertainField[]): DataItem[] {
  const items: DataItem[] = [];
  
  Object.entries(education).forEach(([field, value]) => {
    if (value) {
      const uncertainField = uncertainFields.find(f => f.section === 'education' && f.field === field);
      items.push({
        id: `education-${field}`,
        type: 'education',
        field: field.charAt(0).toUpperCase() + field.slice(1),
        value,
        originalValue: value,
        confidence: uncertainField?.confidence || 0.7,
        section: 'education',
        isEdited: false,
        warnings: uncertainField ? [uncertainField.reason] : undefined,
        suggestions: uncertainField?.alternatives
      });
    }
  });
  
  return items;
}

function createSkillsItems(skills: string[], uncertainFields: UncertainField[]): DataItem[] {
  const uncertainField = uncertainFields.find(f => f.section === 'skills');
  
  return [{
    id: 'skills-list',
    type: 'skills',
    field: 'Skills List',
    value: skills.join(', '),
    originalValue: skills.join(', '),
    confidence: uncertainField?.confidence || 0.8,
    section: 'skills',
    isEdited: false,
    warnings: uncertainField ? [uncertainField.reason] : undefined,
    suggestions: uncertainField?.alternatives
  }];
}

function calculateSectionConfidence(items: DataItem[]): number {
  if (items.length === 0) return 0;
  const totalConfidence = items.reduce((sum, item) => sum + item.confidence, 0);
  return totalConfidence / items.length;
}

function convertSectionsToData(sections: SectionData[]): any {
  const result: any = {};
  
  sections.forEach(section => {
    switch (section.type) {
      case 'contact':
        result.contact = {};
        section.items.forEach(item => {
          const field = item.field.toLowerCase();
          result.contact[field] = item.value;
        });
        break;
        
      case 'experience':
        result.experience = [];
        // Group items by job index
        const expGroups: { [key: number]: any } = {};
        section.items.forEach(item => {
          const match = item.id.match(/experience-(\d+)-(.+)/);
          if (match) {
            const jobIndex = parseInt(match[1]);
            const field = match[2];
            if (!expGroups[jobIndex]) expGroups[jobIndex] = { id: jobIndex + 1 };
            expGroups[jobIndex][field] = item.value;
          }
        });
        result.experience = Object.values(expGroups);
        break;
        
      case 'education':
        result.education = {};
        section.items.forEach(item => {
          const field = item.field.toLowerCase();
          result.education[field] = item.value;
        });
        break;
        
      case 'skills':
        const skillsItem = section.items.find(item => item.field === 'Skills List');
        if (skillsItem && typeof skillsItem.value === 'string') {
          result.skills = skillsItem.value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        }
        break;
    }
  });
  
  return result;
}

export default ManualOverrideInterface;