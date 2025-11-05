-- kanau_pointsテーブルの重複レコードを解決し、UNIQUE制約を追加

-- 1. 重複レコードを統合（同じuser_idのレコードを1つにまとめる）
-- 最新のレコードを保持し、古いレコードのポイントを合計

DO $$
DECLARE
    dup_user RECORD;
    latest_id UUID;
    total_points INT;
    total_earned INT;
    total_spent INT;
    max_consecutive INT;
    max_last_login DATE;
    max_last_bonus DATE;
BEGIN
    -- 重複があるuser_idを取得
    FOR dup_user IN 
        SELECT user_id, COUNT(*) as count
        FROM public.kanau_points
        GROUP BY user_id
        HAVING COUNT(*) > 1
    LOOP
        -- 最新のレコードIDを取得
        SELECT id INTO latest_id
        FROM public.kanau_points
        WHERE user_id = dup_user.user_id
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 1;
        
        -- ポイントを合計
        SELECT 
            COALESCE(SUM(points), 0),
            COALESCE(SUM(total_earned), 0),
            COALESCE(SUM(total_spent), 0),
            MAX(consecutive_login_days),
            MAX(last_login_date),
            MAX(last_login_bonus_date)
        INTO total_points, total_earned, total_spent, max_consecutive, max_last_login, max_last_bonus
        FROM public.kanau_points
        WHERE user_id = dup_user.user_id;
        
        -- 最新レコードを更新
        UPDATE public.kanau_points
        SET 
            points = total_points,
            total_earned = total_earned,
            total_spent = total_spent,
            consecutive_login_days = COALESCE(max_consecutive, 0),
            last_login_date = max_last_login,
            last_login_bonus_date = max_last_bonus,
            updated_at = NOW()
        WHERE id = latest_id;
        
        -- 古いレコードを削除
        DELETE FROM public.kanau_points
        WHERE user_id = dup_user.user_id
        AND id != latest_id;
        
        RAISE NOTICE '重複レコードを統合しました: user_id=%, 削除数=%', dup_user.user_id, dup_user.count - 1;
    END LOOP;
END $$;

-- 2. UNIQUE制約を追加（既存の重複がないことを前提）
-- まず既存の制約を確認
DO $$
BEGIN
    -- UNIQUE制約が存在しない場合のみ追加
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'kanau_points_user_id_unique'
    ) THEN
        ALTER TABLE public.kanau_points
        ADD CONSTRAINT kanau_points_user_id_unique UNIQUE (user_id);
        
        RAISE NOTICE 'UNIQUE制約を追加しました: kanau_points_user_id_unique';
    ELSE
        RAISE NOTICE 'UNIQUE制約は既に存在します';
    END IF;
END $$;

