import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Trash2, Pencil, X } from 'lucide-react';
import * as api from '../lib/api';
import { cn } from '../lib/utils';

export interface Activity {
    id?: number;
    name: string;
    category: string;
    tier: string;
    description: string;
    hours_per_week: number;
    is_leadership: boolean;
    impact_score: number;
}

export function ActivityBuilder() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [form, setForm] = useState<Omit<Activity, 'id' | 'impact_score'>>({
        name: '',
        category: '',
        tier: '',
        description: '',
        hours_per_week: 0,
        is_leadership: false,
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            const data = await api.fetchActivities();
            setActivities(data);
        } catch (error) {
            console.error('Failed to load activities', error);
        }
    };

    const calculateImpactScore = (tier: string, isLeadership: boolean, hours: number) => {
        let score = 0;
        switch (tier) {
            case 'School': score = 1; break;
            case 'Regional': score = 2; break;
            case 'State': score = 3; break;
            case 'National': score = 4; break;
            case 'International': score = 5; break;
            default: score = 0;
        }
        if (isLeadership) score += 2;
        if (hours > 10) score += 1;
        return score;
    };

    const getImpactColor = (score: number) => {
        if (score >= 7) return 'bg-purple-500 hover:bg-purple-600'; // Exceptional
        if (score >= 5) return 'bg-green-500 hover:bg-green-600'; // High
        if (score >= 3) return 'bg-yellow-500 hover:bg-yellow-600'; // Medium
        return 'bg-gray-500 hover:bg-gray-600'; // Low
    };

    const getImpactLabel = (score: number) => {
        if (score >= 7) return 'Exceptional';
        if (score >= 5) return 'High';
        if (score >= 3) return 'Medium';
        return 'Low';
    }

    const currentScore = calculateImpactScore(form.tier, form.is_leadership, form.hours_per_week);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.category || !form.tier || !form.description) return;

        setLoading(true);
        try {
            if (editingId) {
                const updatedActivity = await api.updateActivity(editingId, {
                    ...form,
                    impact_score: currentScore,
                });
                setActivities(activities.map(a => a.id === editingId ? updatedActivity : a));
                setEditingId(null);
            } else {
                const newActivity = await api.createActivity({
                    ...form,
                    impact_score: currentScore,
                });
                setActivities([...activities, newActivity]);
            }
            setForm({
                name: '',
                category: '',
                tier: '',
                description: '',
                hours_per_week: 0,
                is_leadership: false,
            });
        } catch (error) {
            console.error('Failed to create activity', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.deleteActivity(id);
            setActivities(activities.filter(a => a.id !== id));
            if (editingId === id) {
                handleCancelEdit();
            }
        } catch (error) {
            console.error('Failed to delete activity', error);
        }
    };

    const handleEdit = (activity: Activity) => {
        if (!activity.id) return;
        setEditingId(activity.id);
        setForm({
            name: activity.name,
            category: activity.category,
            tier: activity.tier,
            description: activity.description,
            hours_per_week: activity.hours_per_week,
            is_leadership: activity.is_leadership,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({
            name: '',
            category: '',
            tier: '',
            description: '',
            hours_per_week: 0,
            is_leadership: false,
        });
    }

    const isValid = form.name && form.category && form.tier && form.description && form.description.length <= 150 && form.hours_per_week >= 0 && form.hours_per_week <= 40;

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex flex-row">
                        <CardTitle>{editingId ? 'Edit Activity' : 'Add Activity'}</CardTitle>
                        <div className="w-4" />
                        <Badge className={getImpactColor(currentScore)}>
                            {getImpactLabel(currentScore)} ({currentScore})
                        </Badge>
                    </div>
                    {editingId && (
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                            <X className="w-4 h-4 mr-2" /> Cancel Edit
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Activity Name</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Debate Club"
                                    maxLength={50}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={val => setForm({ ...form, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Sports', 'Arts', 'Academic', 'Community Service', 'Leadership', 'Other'].map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tier">Tier</Label>
                                <Select
                                    value={form.tier}
                                    onValueChange={val => setForm({ ...form, tier: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['School', 'Regional', 'State', 'National', 'International'].map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hours">Hours per Week (0-40)</Label>
                                <Input
                                    type="number"
                                    id="hours"
                                    min={0}
                                    value={form.hours_per_week}
                                    onChange={e => setForm({ ...form, hours_per_week: Number(e.target.value) })}
                                    onFocus={(e) => e.target.select()}
                                    className={cn(
                                        "focus-visible:ring-0 focus-visible:border-2 focus-visible:border-foreground",
                                        form.hours_per_week > 40 && "border-red-500 focus-visible:border-red-500"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe your role and achievements..."
                                className={cn(
                                    "focus-visible:ring-0 focus-visible:border-2 focus-visible:border-foreground",
                                    form.description.length > 150 && "border-red-500 focus-visible:border-red-500"
                                )}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span className={form.description.length > 150 ? 'text-red-500' : ''}>
                                    {form.description.length}/150 characters
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="leadership"
                                checked={form.is_leadership}
                                onCheckedChange={checked => setForm({ ...form, is_leadership: checked as boolean })}
                            />
                            <Label htmlFor="leadership">Leadership Position (+2 Impact Bonus)</Label>
                        </div>

                        <div className="flex items-center justify-end">

                            <Button type="submit" disabled={!isValid || loading}>
                                {loading ? 'Saving...' : 'Submit'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Activities</h2>
                {activities.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No activities added yet.</p>
                )}
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
                    {activities.map(activity => (
                        <Card key={activity.id} className="relative flex flex-col h-full w-full">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge className={getImpactColor(activity.impact_score)}>
                                        Impact: {activity.impact_score}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(activity)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => activity.id && handleDelete(activity.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-xl mb-1 break-words">{activity.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-grow">
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                                    <Badge variant="outline">{activity.category}</Badge>
                                    <Badge variant="outline">{activity.tier}</Badge>
                                    <Badge variant="outline">{activity.hours_per_week} hrs/wk</Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words flex-grow">
                                    {activity.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
