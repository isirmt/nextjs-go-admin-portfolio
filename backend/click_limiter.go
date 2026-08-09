package main

import (
	"sync"
	"time"
)

type clickLimiter struct {
	mu              sync.Mutex
	lastClicks      map[string]time.Time
	minInterval     time.Duration
	maxEntries      int
	cleanupInterval time.Duration
	lastCleanup     time.Time
}

func createClickLimiter(minInterval time.Duration, maxEntries int, cleanupInterval time.Duration) *clickLimiter {
	return &clickLimiter{
		lastClicks:      make(map[string]time.Time),
		minInterval:     minInterval,
		maxEntries:      maxEntries,
		cleanupInterval: cleanupInterval,
		lastCleanup:     time.Now(),
	}
}

func (l *clickLimiter) isAllowedClick(ip, workID string) bool {
	if l == nil {
		return true
	}

	now := time.Now()
	key := ip + "|" + workID

	l.mu.Lock()
	defer l.mu.Unlock()

	if last, ok := l.lastClicks[key]; ok && now.Sub(last) < l.minInterval {
		return false
	}
	l.lastClicks[key] = now

	if len(l.lastClicks) > l.maxEntries || now.Sub(l.lastCleanup) >= l.cleanupInterval {
		expireBefore := now.Add(-l.minInterval * 10)
		for k, t := range l.lastClicks {
			if t.Before(expireBefore) {
				delete(l.lastClicks, k)
			}
		}
		l.lastCleanup = now
	}

	return true
}
