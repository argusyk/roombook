#!/usr/bin/env bash
# tools/metrics/pr-metrics.sh <owner/repo> <від YYYY-MM-DD> <до YYYY-MM-DD>
# Злиті PR за період -> CSV у stdout (схема – таблиця К.1).
set -euo pipefail
repo="$1"; from="$2"; to="$3"

echo "number,created_at,merged_at,hours_to_merge,agent,changes_requested,missed_by_review"
gh api graphql --paginate \
  -f q="repo:$repo is:pr is:merged merged:$from..$to" \
  -f query='
query($q: String!, $endCursor: String) {
  search(query: $q, type: ISSUE, first: 100, after: $endCursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on PullRequest {
        number
        createdAt
        mergedAt
        labels(first: 20) { nodes { name } }
        reviews(states: CHANGES_REQUESTED) { totalCount }
      }
    }
  }
}' \
  --jq '.data.search.nodes[]
    | [ .number, .createdAt, .mergedAt,
        ((((.mergedAt | fromdate) - (.createdAt | fromdate)) / 360 | round) / 10),
        (if any(.labels.nodes[]; .name == "agent") then 1 else 0 end),
        .reviews.totalCount,
        (if any(.labels.nodes[]; .name == "missed-by-review") then 1 else 0 end) ]
    | @csv'
