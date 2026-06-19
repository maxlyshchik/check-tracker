import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Получаем профиль, если нет – создаём
    // eslint-disable-next-line prefer-const
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code === 'PGRST116') {
        // Профиль не найден, создаём
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: userId })
            .select()
            .single();
        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
        profile = newProfile;
    } else if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
}