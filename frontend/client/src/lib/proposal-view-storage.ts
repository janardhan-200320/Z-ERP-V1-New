import { safeGetItem, safeSetItem } from '@/lib/storage';

const PROPOSAL_VIEW_STORAGE_KEY = 'sales.proposalViewData';

type ProposalViewStore = Record<string, any>;

export const saveProposalForStandaloneView = (proposal: any) => {
  if (!proposal?.id) return;

  const existing = safeGetItem<ProposalViewStore>(PROPOSAL_VIEW_STORAGE_KEY, {});
  const updated: ProposalViewStore = {
    ...existing,
    [proposal.id]: proposal,
  };

  safeSetItem(PROPOSAL_VIEW_STORAGE_KEY, updated);
};

export const getProposalForStandaloneView = (proposalId: string) => {
  if (!proposalId) return null;

  const stored = safeGetItem<ProposalViewStore>(PROPOSAL_VIEW_STORAGE_KEY, {});
  return stored[proposalId] ?? null;
};

export const updateProposalForStandaloneView = (
  proposalId: string,
  updates: Record<string, any>,
) => {
  if (!proposalId) return null;

  const stored = safeGetItem<ProposalViewStore>(PROPOSAL_VIEW_STORAGE_KEY, {});
  const existing = stored[proposalId];
  if (!existing) return null;

  const updatedRecord = {
    ...existing,
    ...updates,
  };

  safeSetItem(PROPOSAL_VIEW_STORAGE_KEY, {
    ...stored,
    [proposalId]: updatedRecord,
  });

  return updatedRecord;
};
