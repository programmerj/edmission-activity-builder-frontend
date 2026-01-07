const API_URL = 'http://localhost:8000';

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

export async function fetchActivities(): Promise<Activity[]> {
    const response = await fetch(`${API_URL}/activities/`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
}

export async function createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const response = await fetch(`${API_URL}/activities/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
    });
    if (!response.ok) throw new Error('Failed to create activity');
    return response.json();
}


export async function deleteActivity(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/activities/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete activity');
}

export async function updateActivity(id: number, activity: Omit<Activity, 'id'>): Promise<Activity> {
    const response = await fetch(`${API_URL}/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
    });
    if (!response.ok) throw new Error('Failed to update activity');
    return response.json();
}

