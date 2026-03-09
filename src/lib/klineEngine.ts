import { UserLifeData } from '@/store/useLifeStore'

export interface KlineDataPoint {
    age: number;
    open: number;
    close: number;
    high: number;
    low: number;
    milestone?: string;
    isBull?: boolean;
}

export interface MatchResult {
    score: number;
    syncRatio: number;
    crossPoints: number;
    report: string;
}

// Simple seeded random to make it somewhat deterministic
function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

export async function generateLifeData(user: Partial<UserLifeData>): Promise<KlineDataPoint[]> {
    try {
        const res = await fetch('/api/generate-kline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userData: user })
        });

        if (!res.ok) {
            console.warn("API Error, falling back to local simulation.");
            return generateMockLifeData(user);
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
        return generateMockLifeData(user);
    } catch (error) {
        console.error("Network Fetch Error, falling back to local simulation.", error);
        return generateMockLifeData(user);
    }
}

export function generateMockLifeData(user: Partial<UserLifeData>): KlineDataPoint[] {
    const data: KlineDataPoint[] = [];
    let currentFortune = 50;

    // Use a string hash to seed
    const strToSeed = `${user.birthYear || ''}${user.birthCity || ''}${user.universityCity || ''}`;
    let seed = 1990;
    for (let i = 0; i < strToSeed.length; i++) {
        seed += strToSeed.charCodeAt(i) * (i + 1);
    }

    for (let age = 0; age <= 80; age++) {
        let trend = 0;
        let volatility = 10;
        let milestone = undefined;

        // Milestones and Logic Modifiers
        if (age === 18 && user.universityCity) {
            trend = 15;
            milestone = `大学 (${user.universityCity})`;
        } else if (age === 24 && user.currentOccupation) {
            trend = -5;
            volatility = 20;
            milestone = `职场 (${user.currentOccupation})`;
        } else if (age === 30 && user.currentCity) {
            trend = 10;
            milestone = `${user.currentCity}扎根`;
        } else if (age > 35 && age < 45) {
            trend = -2;
            volatility = 15;
        } else if (age === 60) {
            trend = 5;
            milestone = "退休";
            volatility = 5;
        }

        // Calculate Candlestick values
        const change = (seededRandom(seed++) - 0.5) * volatility + trend;
        const open = currentFortune;
        let close = currentFortune + change;

        // Ensure bounds
        close = Math.max(0, Math.min(100, close));

        const high = Math.max(open, close) + seededRandom(seed++) * volatility * 0.5;
        const low = Math.min(open, close) - seededRandom(seed++) * volatility * 0.5;

        currentFortune = close;

        data.push({
            age,
            open: Math.round(open),
            close: Math.round(close),
            high: Math.round(Math.min(100, high)),
            low: Math.round(Math.max(0, low)),
            milestone,
            isBull: close >= open
        });
    }

    return data;
}

export function calculateMatchScore(data1: KlineDataPoint[], data2: KlineDataPoint[]): MatchResult {
    let syncCount = 0;
    let crossCount = 0;
    let totalDiff = 0;

    for (let i = 20; i <= 80; i++) { // Start comparing from age 20
        const d1 = data1[i];
        const d2 = data2[i];

        if (!d1 || !d2) continue;

        // Check if trends align (both up or both down)
        if (d1.isBull === d2.isBull) {
            syncCount++;
        }

        // Check for crosses
        const prevD1 = data1[i - 1];
        const prevD2 = data2[i - 1];
        if (prevD1 && prevD2) {
            if ((prevD1.close > prevD2.close && d1.close < d2.close) ||
                (prevD1.close < prevD2.close && d1.close > d2.close)) {
                crossCount++;
            }
        }

        totalDiff += Math.abs(d1.close - d2.close);
    }

    const period = 60; // 80 - 20
    const syncRatio = syncCount / period; // 0 to 1
    const avgDiff = totalDiff / period; // 0 to 100

    // Score calculation:
    // High sync + low vertical diff = High score
    const score = Math.round((syncRatio * 50) + (Math.max(0, 100 - avgDiff) * 0.5));

    let report = "你们是天作之合，命运曲线高度吻合。在人生的低谷期你们能互相扶持，在巅峰期也能共享荣耀。灵魂伴侣指数极高。";
    if (score < 60) {
        report = "你们的生命轨迹有很多不同的方向，摩擦与错位时有发生。这需要更多的包容与理解，或许互补的性格能擦出不一样的火花。";
    } else if (score < 80) {
        report = "命运的齿轮在关键节点有所交汇。你们既有各自的人生主线，也能在特定阶段同频共振。是个充满活力与变数的组合。";
    }

    return {
        score,
        syncRatio,
        crossPoints: crossCount,
        report
    };
}
