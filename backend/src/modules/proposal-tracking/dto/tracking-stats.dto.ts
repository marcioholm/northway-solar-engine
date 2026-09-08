export class ProposalTrackingStatsDto {
  proposalId!: string;
  firstView!: Date | null;
  lastView!: Date | null;
  totalViews!: number;
  totalDurationSeconds!: number;
  averageDurationSeconds!: number;
  downloads!: number;
  whatsappClicks!: number;
  accepts!: number;
  changeRequests!: number;
  sections!: Array<{
    name: string;
    views: number;
    totalDurationSeconds: number;
  }>;
}
