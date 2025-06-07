"use client";

import React, { useState } from 'react';
import { Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Plus, Mic2, X, Share2, Link as LucideLink, Tag, Settings, Loader2 } from 'lucide-react';
import { Badge } from "@/components/@/ui/badge"
import { Card } from "@/components/@/ui/card"

type Availability = 'available' | 'busy' | 'not_available';

interface Rates {
  hourly?: number;
  project?: number;
}

interface FormData extends Omit<Profile, 'id'> {
  id: string;
}

interface SettingsDialogContentProps {
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  profile: Profile;
  onClose: () => void;
}

export function SettingsDialogContent({ updateProfile, profile, onClose }: SettingsDialogContentProps) {
  const [formData, setFormData] = useState<FormData>(() => ({
    id: profile?.id || '',
    name: profile?.name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    professionalTitle: profile?.professionalTitle || '',
    genres: profile?.genres || [],
    instruments: profile?.instruments || [],
    yearsOfExperience: profile?.yearsOfExperience || 0,
    rates: profile?.rates || { hourly: 0, project: 0 },
    availability: profile?.availability || 'available',
    links: profile?.links || [],
    tags: profile?.tags || [],
    socialLinks: profile?.socialLinks || [],
    username: profile?.username || '',
    avatarUrl: profile?.avatarUrl || '',
    bannerUrl: profile?.bannerUrl || '',
    createdAt: profile?.createdAt || new Date().toISOString(),
    updatedAt: profile?.updatedAt || new Date().toISOString()
  }));

  const [activeSection, setActiveSection] = useState('Basic Info');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newGenre, setNewGenre] = useState('');
  const [newInstrument, setNewInstrument] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({...profile, ...formData});
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = () => {
    if (newGenre && !formData.genres?.includes(newGenre)) {
      setFormData(prev => ({
        ...prev,
        genres: [...(prev.genres || []), newGenre]
      }));
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (index: number) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres?.filter((_, i) => i !== index)
    }));
  };

  const handleAddInstrument = () => {
    if (newInstrument && !formData.instruments?.includes(newInstrument)) {
      setFormData(prev => ({
        ...prev,
        instruments: [...(prev.instruments || []), newInstrument]
      }));
      setNewInstrument('');
    }
  };

  const handleRemoveInstrument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instruments: prev.instruments?.filter((_, i) => i !== index)
    }));
  };

  const handleAddLink = () => {
    if (newLink && !formData.links?.includes(newLink)) {
      setFormData(prev => ({
        ...prev,
        links: [...(prev.links || []), newLink]
      }));
      setNewLink('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links?.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index)
    }));
  };

  const handleAddSocialLink = () => {
    if (newSocialPlatform && newSocialUrl) {
      const newLink = { platform: newSocialPlatform, url: newSocialUrl };
      if (!formData.socialLinks?.some(link => link.platform === newSocialPlatform)) {
        setFormData(prev => ({
          ...prev,
          socialLinks: [...(prev.socialLinks || []), newLink]
        }));
        setNewSocialPlatform('');
        setNewSocialUrl('');
      }
    }
  };

  const handleRemoveSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks?.filter((_, i) => i !== index)
    }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case "Basic Info":
        return (
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  disabled={loading}
                />
                <Button variant="outline" size="icon" onClick={() => console.log("Get current location")}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      case "Professional Info":
        return (
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="professionalTitle">Professional Title</Label>
              <Input
                id="professionalTitle"
                type="text"
                value={formData.professionalTitle}
                onChange={(e) => handleInputChange("professionalTitle", e.target.value)}
                placeholder="e.g. Music Producer, Sound Engineer"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Genres</Label>
              <div className="flex gap-2">
                <Input
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="Add a genre"
                  disabled={loading}
                />
                <Button onClick={handleAddGenre} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.genres?.map((genre: string, index: number) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <Mic2 className="h-3 w-3" />
                    {genre}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGenre(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instruments</Label>
              <div className="flex gap-2">
                <Input
                  value={newInstrument}
                  onChange={(e) => setNewInstrument(e.target.value)}
                  placeholder="Add an instrument"
                  disabled={loading}
                />
                <Button onClick={handleAddInstrument} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.instruments?.map((instrument: string, index: number) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <Mic2 className="h-3 w-3" />
                    {instrument}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInstrument(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input
                type="number"
                value={formData.yearsOfExperience ?? ""}
                onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value || "0"))}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rates</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Hourly Rate</Label>
                    <Input
                      type="number"
                      value={formData.rates?.hourly || ''}
                      onChange={(e) => handleInputChange('rates', { ...formData.rates, hourly: parseFloat(e.target.value) })}
                      placeholder="Enter hourly rate"
                    />
                  </div>
                  <div>
                    <Label>Project Rate</Label>
                    <Input
                      type="number"
                      value={formData.rates?.project || ''}
                      onChange={(e) => handleInputChange('rates', { ...formData.rates, project: parseFloat(e.target.value) })}
                      placeholder="Enter project rate"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <div className="flex gap-2">
                <select
                  className="w-full bg-background border rounded-md px-3 py-2"
                  value={formData.availability || "available"}
                  onChange={(e) => handleInputChange("availability", e.target.value as 'available' | 'busy' | 'not_available')}
                >
                  <option value="available">Available for Work</option>
                  <option value="busy">Currently Busy</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>
            </div>
          </div>
        );
      case "Social Media":
        return (
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Social Links</Label>
              <div className="flex gap-2">
                <Input
                  value={newSocialPlatform}
                  onChange={(e) => setNewSocialPlatform(e.target.value)}
                  placeholder="Platform"
                  disabled={loading}
                />
                <Input
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="URL"
                  disabled={loading}
                />
                <Button onClick={handleAddSocialLink} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.socialLinks?.map((link: { platform: string; url: string; }, index: number) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    {link.platform} - {link.url}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSocialLink(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      case "Links":
        return (
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Links</Label>
              <div className="flex gap-2">
                <Input
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="Add a link"
                  disabled={loading}
                />
                <Button onClick={handleAddLink} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.links?.map((link: string, index: number) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <LucideLink className="h-3 w-3" />
                    {link}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLink(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      case "Tags":
        return (
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  disabled={loading}
                />
                <Button onClick={handleAddTag} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTag(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    {
      name: "Basic Info",
      icon: MapPin,
    },
    {
      name: "Professional Info",
      icon: Mic2,
    },
    {
      name: "Social Media",
      icon: Share2,
    },
    {
      name: "Links",
      icon: LucideLink,
    },
    {
      name: "Tags",
      icon: Tag,
    },
  ]

  // Main return for the dialog
  return (
    <Card className="max-w-md w-full">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 p-4">
        <Settings className="h-5 w-5" />
        Settings
      </h2>
      <div className="flex">
        <ul className="w-56">
          {navItems.map((item) => (
            <li
              key={item.name}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent ${activeSection === item.name ? 'bg-accent' : ''}`}
              onClick={() => setActiveSection(item.name)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </li>
          ))}
        </ul>
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
          <div className="flex items-center justify-end gap-4 mt-8">
            {success && (
              <span className="text-green-600 animate-pulse">Profile updated!</span>
            )}
            <Button onClick={() => onClose()} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
