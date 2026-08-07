import type {SupabaseClient} from "@supabase/supabase-js";
import {useCallback, useEffect, useState} from "react";
import {useLocation, useOutletContext} from "react-router";

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'think';

export type ReactionCounts = Record<ReactionType, number>;
export type ReactionSummary = Partial<ReactionCounts>;

type ReactionProps = {
  contentType: 'article' | 'photo' | 'thought';
  contentId: number;
  reactions?: ReactionSummary | null;
  className?: string;
};

type OutletContext = { supabase: SupabaseClient };

type ReactionConfig = { key: ReactionType; emoji: string; label: string };

const REACTION_CONFIG: ReactionConfig[] = [
  {key: 'like', emoji: '👍', label: 'Like'},
  {key: 'love', emoji: '❤️', label: 'Love'},
  {key: 'haha', emoji: '😂', label: 'Haha'},
  {key: 'wow', emoji: '😮', label: 'Wow'},
  {key: 'sad', emoji: '😢', label: 'Sad'},
  {key: 'think', emoji: '🤔', label: 'Think'},
];

const STORAGE_PREFIX = 'reaction_';
const STORAGE_TTL = 1000 * 60 * 60 * 24 * 14; // 14 days

const normalizeCounts = (value: unknown, fallback: ReactionCounts): ReactionCounts => {
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const record = value as Record<string, unknown>;
  return REACTION_CONFIG.reduce<ReactionCounts>((acc, item) => {
    const raw = record[item.key];
    acc[item.key] = typeof raw === 'number' ? raw : fallback[item.key];
    return acc;
  }, {...fallback});
};

const getStorageKey = (pathname: string, reaction: ReactionType) => {
  return `${STORAGE_PREFIX}${pathname}_${reaction}`;
};

const readStoredReactions = (pathname: string): Set<ReactionType> => {
  if (typeof window === 'undefined') {
    return new Set();
  }

  const now = Date.now();
  const selected = new Set<ReactionType>();

  REACTION_CONFIG.forEach(({key}) => {
    const itemKey = getStorageKey(pathname, key);
    const raw = window.localStorage.getItem(itemKey);

    if (!raw) {
      return;
    }

    const timestamp = Number(raw);
    if (Number.isFinite(timestamp) && now - timestamp < STORAGE_TTL) {
      selected.add(key);
    } else {
      window.localStorage.removeItem(itemKey);
    }
  });

  return selected;
};

const storeReaction = (pathname: string, reaction: ReactionType) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(getStorageKey(pathname, reaction), String(Date.now()));
};

export default function Reaction({
  contentType,
  contentId,
  reactions,
  className = ''
}: ReactionProps) {
  const {supabase} = useOutletContext<OutletContext>();
  const {pathname} = useLocation();
  const [counts, setCounts] = useState<ReactionCounts>(() => ({
    like: reactions?.like ?? 0,
    love: reactions?.love ?? 0,
    haha: reactions?.haha ?? 0,
    wow: reactions?.wow ?? 0,
    sad: reactions?.sad ?? 0,
    think: reactions?.think ?? 0
  }));
  const [active, setActive] = useState<Set<ReactionType>>(new Set());
  const [pending, setPending] = useState<ReactionType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActive(readStoredReactions(pathname));
  }, [pathname]);

  useEffect(() => {
    setCounts((prev) => ({
      like: reactions?.like ?? prev.like ?? 0,
      love: reactions?.love ?? prev.love ?? 0,
      haha: reactions?.haha ?? prev.haha ?? 0,
      wow: reactions?.wow ?? prev.wow ?? 0,
      sad: reactions?.sad ?? prev.sad ?? 0,
      think: reactions?.think ?? prev.think ?? 0
    }));
  }, [reactions]);

  const handleReaction = useCallback(async (reaction: ReactionType) => {
    if (pending || active.has(reaction)) {
      return;
    }

    setPending(reaction);
    setError(null);

    const fallback = {
      ...counts,
      [reaction]: (counts[reaction] ?? 0) + 1
    } as ReactionCounts;

    const {data, error: rpcError} = await supabase.rpc('add_reaction', {
      content_type: contentType,
      content_id: contentId,
      reaction_type: reaction
    });

    if (rpcError) {
      console.error(rpcError);
      setError('提交失败，请稍后重试。');
      setPending(null);
      return;
    }

    const nextCounts = normalizeCounts(data, fallback);
    setCounts(nextCounts);

    setActive((prev) => {
      const updated = new Set(prev);
      updated.add(reaction);
      storeReaction(pathname, reaction);
      return updated;
    });

    setPending(null);
  }, [active, contentId, contentType, counts, pathname, supabase, pending]);

  return (
    <div className="my-4 rounded-xl flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {REACTION_CONFIG.map(({key, emoji}) => {
          const isActive = active.has(key);
          const isLoading = pending === key;
          const count = counts[key] ?? 0;

          return (
            <button
              key={key}
              type="button"
              aria-pressed={isActive}
              disabled={isLoading}
              onClick={() => handleReaction(key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition
              ${isActive ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-inner' : 'border-zinc-200 bg-white text-zinc-700 hover:border-violet-200 hover:text-violet-700'}
              ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-lg" aria-hidden="true">{emoji}</span>
              <span className="text-xs text-zinc-500">· {count}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500 px-1">{error}</p>}
    </div>
  );
}
