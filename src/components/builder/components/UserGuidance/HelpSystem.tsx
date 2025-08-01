import React, { useState, useMemo } from 'react';
import { Search, HelpCircle, Book, MessageCircle, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful?: number;
  notHelpful?: number;
}

export interface TroubleshootingItem {
  id: string;
  problem: string;
  symptoms: string[];
  solutions: Array<{
    step: string;
    description: string;
    code?: string;
  }>;
  category: string;
  severity: 'low' | 'medium' | 'high';
  relatedFAQs?: string[];
}

export interface HelpResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'guide' | 'video' | 'article' | 'external';
  category: string;
  duration?: string;
}

interface HelpSystemProps {
  faqs: FAQItem[];
  troubleshooting: TroubleshootingItem[];
  resources: HelpResource[];
  onContactSupport?: () => void;
  onFeedback?: (itemId: string, helpful: boolean) => void;
}

export const HelpSystem: React.FC<HelpSystemProps> = ({
  faqs,
  troubleshooting,
  resources,
  onContactSupport,
  onFeedback
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter and search functionality
  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchQuery, selectedCategory]);

  const filteredTroubleshooting = useMemo(() => {
    return troubleshooting.filter(item => {
      const matchesSearch = searchQuery === '' ||
        item.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symptoms.some(symptom => symptom.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [troubleshooting, searchQuery, selectedCategory]);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = searchQuery === '' ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [resources, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = new Set([
      ...faqs.map(faq => faq.category),
      ...troubleshooting.map(item => item.category),
      ...resources.map(resource => resource.category)
    ]);
    return ['all', ...Array.from(allCategories)];
  }, [faqs, troubleshooting, resources]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-600">Find answers to common questions and get help with your resume</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Book className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">User Guide</h3>
            <p className="text-sm text-gray-600">Complete guide to using the resume builder</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
            <p className="text-sm text-gray-600">Frequently asked questions and answers</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={onContactSupport}
        >
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600">Get help from our support team</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ ({filteredFAQs.length})</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting ({filteredTroubleshooting.length})</TabsTrigger>
          <TabsTrigger value="resources">Resources ({filteredResources.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No FAQ items found matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map(faq => (
              <FAQCard key={faq.id} faq={faq} onFeedback={onFeedback} />
            ))
          )}
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4">
          {filteredTroubleshooting.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No troubleshooting items found matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTroubleshooting.map(item => (
              <TroubleshootingCard key={item.id} item={item} />
            ))
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No resources found matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const FAQCard: React.FC<{
  faq: FAQItem;
  onFeedback?: (itemId: string, helpful: boolean) => void;
}> = ({ faq, onFeedback }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-left text-base font-medium">
                {faq.question}
              </CardTitle>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="prose prose-sm max-w-none mb-4">
              <p className="text-gray-700">{faq.answer}</p>
            </div>

            {/* Tags */}
            {faq.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {faq.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Feedback */}
            {onFeedback && (
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-600">Was this helpful?</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFeedback(faq.id, true)}
                    className="text-xs"
                  >
                    👍 Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFeedback(faq.id, false)}
                    className="text-xs"
                  >
                    👎 No
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const TroubleshootingCard: React.FC<{
  item: TroubleshootingItem;
}> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(item.severity)}`}>
                  {item.severity.toUpperCase()}
                </span>
                <CardTitle className="text-left text-base font-medium">
                  {item.problem}
                </CardTitle>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Symptoms */}
            {item.symptoms.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Symptoms:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {item.symptoms.map((symptom, index) => (
                    <li key={index} className="text-sm text-gray-700">{symptom}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Solutions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Solutions:</h4>
              <ol className="space-y-3">
                {item.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{solution.step}</p>
                      <p className="text-sm text-gray-600 mt-1">{solution.description}</p>
                      {solution.code && (
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                          <code>{solution.code}</code>
                        </pre>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const ResourceCard: React.FC<{
  resource: HelpResource;
}> = ({ resource }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'guide':
        return '📖';
      case 'article':
        return '📄';
      case 'external':
        return '🔗';
      default:
        return '📋';
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{getTypeIcon(resource.type)}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="capitalize">{resource.type}</span>
                {resource.duration && (
                  <>
                    <span>•</span>
                    <span>{resource.duration}</span>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(resource.url, '_blank')}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpSystem;