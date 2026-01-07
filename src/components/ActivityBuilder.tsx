import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Part A: Object lookup pattern for tier scores (더 효율적이고 유지보수 쉬움)
const TIER_SCORES = {
    'School': 1,
    'Regional': 2,
    'State': 3,
    'National': 4,
    'International': 5
} as const;

const CATEGORIES = ['Sports', 'Arts', 'Academic', 'Community Service', 'Leadership', 'Other'] as const;
const TIERS = ['School', 'Regional', 'State', 'National', 'International'] as const;

// Part A: 최적화된 계산 함수
const calculateImpactScore = (tier: string, isLeadership: boolean, hours: number): number => {
    let score = TIER_SCORES[tier as keyof typeof TIER_SCORES] || 0;
    if (isLeadership) score += 2;
    if (hours > 10) score += 1;
    return score;
};

const getImpactColor = (score: number): string => {
    if (score >= 7) return 'bg-purple-500 hover:bg-purple-600';
    if (score >= 5) return 'bg-green-500 hover:bg-green-600';
    if (score >= 3) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-gray-500 hover:bg-gray-600';
};

const getImpactLabel = (score: number): string => {
    if (score >= 7) return 'Exceptional';
    if (score >= 5) return 'High';
    if (score >= 3) return 'Medium';
    return 'Low';
};

// Part D: ActivityCard를 별도 컴포넌트로 분리 + React.memo (50개 활동 시 성능 개선)
interface ActivityCardProps {
    activity: Activity;
    onEdit: (activity: Activity) => void;
    onDelete: (id: number) => void;
}

const ActivityCard = React.memo(({ activity, onEdit, onDelete }: ActivityCardProps) => {
    return (
        <Card className="relative flex flex-col h-full w-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                    <Badge
                        className={getImpactColor(activity.impact_score)}
                        aria-label={`Impact score: ${activity.impact_score} out of 8, rated as ${getImpactLabel(activity.impact_score)}`}
                    >
                        Impact: {activity.impact_score}
                    </Badge>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(activity)}
                            aria-label={`Edit ${activity.name}`}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => activity.id && onDelete(activity.id)}
                            aria-label={`Delete ${activity.name}`}
                        >
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
    );
});

ActivityCard.displayName = 'ActivityCard';

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

    // Part A: useMemo로 불필요한 재계산 방지 (tier, leadership, hours가 변경될 때만 계산)
    const currentScore = useMemo(
        () => calculateImpactScore(form.tier, form.is_leadership, form.hours_per_week),
        [form.tier, form.is_leadership, form.hours_per_week]
    );

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

    // Part B & D: Optimistic Updates + useCallback로 핸들러 안정화
    const handleDelete = useCallback(async (id: number) => {
        // 1. 낙관적 업데이트: 즉시 UI 반영
        const previousActivities = activities;
        setActivities(activities.filter(a => a.id !== id));

        if (editingId === id) {
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

        try {
            // 2. 서버 요청
            await api.deleteActivity(id);
        } catch (error) {
            // 3. 실패 시 복구
            console.error('Failed to delete activity', error);
            setActivities(previousActivities);
            // 실제 앱에서는 사용자에게 토스트 알림 등으로 에러 표시
        }
    }, [activities, editingId]);

    // Part D: useCallback으로 리렌더링 최적화
    const handleEdit = useCallback((activity: Activity) => {
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
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setForm({
            name: '',
            category: '',
            tier: '',
            description: '',
            hours_per_week: 0,
            is_leadership: false,
        });
    }, []);

    const isValid = form.name && form.category && form.tier && form.description && form.description.length <= 150 && form.hours_per_week >= 0 && form.hours_per_week <= 40;

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex flex-row">
                        <CardTitle>{editingId ? 'Edit Activity' : 'Add Activity'}</CardTitle>
                        <div className="w-4" />
                        {/* Part C: 스크린 리더를 위한 ARIA label 추가 */}
                        <Badge
                            className={getImpactColor(currentScore)}
                            aria-label={`Impact score: ${currentScore} out of 8, rated as ${getImpactLabel(currentScore)}`}
                        >
                            {getImpactLabel(currentScore)} ({currentScore})
                        </Badge>
                    </div>
                    {editingId && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            aria-label="Cancel editing activity"
                        >
                            <X className="w-4 h-4 mr-2" /> Cancel Edit
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Part C: 접근성 개선 - ARIA 속성 추가 */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Activity Name</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Debate Club"
                                    maxLength={50}
                                    required
                                    aria-label="Activity Name"
                                    aria-required="true"
                                    className="focus-visible:ring-0 focus-visible:border-2 focus-visible:border-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={val => setForm({ ...form, category: val })}
                                >
                                    <SelectTrigger
                                        id="category"
                                        aria-label="Select activity category"
                                        className="focus-visible:ring-0 focus-visible:border-2 focus-visible:border-foreground"
                                    >
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => (
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
                                    <SelectTrigger
                                        id="tier"
                                        aria-label="Select activity tier or level"
                                        className="focus-visible:ring-0 focus-visible:border-2 focus-visible:border-foreground"
                                    >
                                        <SelectValue placeholder="Select Tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIERS.map(t => (
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
                                    aria-label="Hours per week spent on this activity"
                                    aria-invalid={form.hours_per_week > 40}
                                    aria-describedby={form.hours_per_week > 40 ? "hours-error" : undefined}
                                />
                                {form.hours_per_week > 40 && (
                                    <span id="hours-error" className="text-red-500 text-sm">
                                        Hours must be 40 or less
                                    </span>
                                )}
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
                                aria-label="Activity description"
                                aria-invalid={form.description.length > 150}
                                aria-describedby="description-counter"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span
                                    id="description-counter"
                                    className={form.description.length > 150 ? 'text-red-500' : ''}
                                    aria-live="polite"
                                >
                                    {form.description.length}/150 characters
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="leadership"
                                checked={form.is_leadership}
                                onCheckedChange={checked => setForm({ ...form, is_leadership: checked as boolean })}
                                aria-label="Leadership position adds 2 points to impact score"
                            />
                            <Label htmlFor="leadership">Leadership Position (+2 Impact Bonus)</Label>
                        </div>

                        <div className="flex items-center justify-end">
                            <Button
                                type="submit"
                                disabled={!isValid || loading}
                                aria-label={editingId ? "Update activity" : "Add activity"}
                            >
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
                <div
                    className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3"
                    role="list"
                    aria-label="List of your activities"
                >
                    {/* Part D: React.memo로 감싼 ActivityCard 사용 - 50개 활동 시 리렌더링 최적화 */}
                    {activities.map(activity => (
                        <div key={activity.id} role="listitem">
                            <ActivityCard
                                activity={activity}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
