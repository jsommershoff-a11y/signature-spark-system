/**
 * Konsistenz-Tests für Pipeline-Stage-Labels.
 *
 * Ziel: Wenn jemand `PIPELINE_STAGE_LABELS` in `@/types/crm` ändert, müssen
 * `PipelineColumn`, `PipelineStatsWidget` und `PipelineHeatmap` automatisch
 * den neuen Text rendern. Diese Tests fangen Regressionen, bei denen jemand
 * versehentlich Labels hartkodiert.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_HINTS,
  type PipelineStage,
} from '@/types/crm';

import { PipelineColumn } from '../PipelineColumn';
import { PipelineHeatmap } from '../PipelineHeatmap';
import { PipelineStatsWidget } from '@/components/dashboard/PipelineStatsWidget';

const ALL_STAGES: PipelineStage[] = [
  'new_lead',
  'setter_call_scheduled',
  'setter_call_done',
  'analysis_ready',
  'offer_draft',
  'offer_sent',
  'payment_unlocked',
  'won',
  'lost',
];

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  cleanup();
});

describe('PIPELINE_STAGE_LABELS — Source of Truth', () => {
  it('definiert für jede PipelineStage ein nicht-leeres Label', () => {
    for (const stage of ALL_STAGES) {
      expect(PIPELINE_STAGE_LABELS[stage]).toBeDefined();
      expect(PIPELINE_STAGE_LABELS[stage].trim().length).toBeGreaterThan(0);
    }
  });

  it('definiert für jede PipelineStage einen nicht-leeren Hinweistext', () => {
    for (const stage of ALL_STAGES) {
      expect(PIPELINE_STAGE_HINTS[stage]).toBeDefined();
      expect(PIPELINE_STAGE_HINTS[stage].trim().length).toBeGreaterThan(0);
    }
  });

  it('hat keine Duplikate in den Labels', () => {
    const labels = ALL_STAGES.map((s) => PIPELINE_STAGE_LABELS[s]);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('PipelineColumn rendert Label aus zentraler Quelle', () => {
  it.each(ALL_STAGES)('rendert Label für Stage "%s"', (stage) => {
    renderWithRouter(<PipelineColumn stage={stage} items={[]} />);
    // Label kann mehrfach vorkommen (Title + a11y) → getAllByText
    const matches = screen.getAllByText(PIPELINE_STAGE_LABELS[stage]);
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe('PipelineHeatmap rendert Labels aus zentraler Quelle', () => {
  it('rendert für jede Stage das zentrale Label', () => {
    const empty = ALL_STAGES.reduce((acc, s) => {
      acc[s] = [];
      return acc;
    }, {} as Record<PipelineStage, []>);

    renderWithRouter(
      <PipelineHeatmap
        pipelineByStage={empty as never}
        stageOrder={ALL_STAGES}
        selectedStage={null}
        onStageSelect={() => {}}
      />
    );

    for (const stage of ALL_STAGES) {
      const matches = screen.getAllByText(PIPELINE_STAGE_LABELS[stage]);
      expect(matches.length).toBeGreaterThan(0);
    }
  });
});

describe('PipelineStatsWidget rendert Labels aus zentraler Quelle', () => {
  it('rendert für jede Stage das zentrale Label', () => {
    const stats = ALL_STAGES.map((stage) => ({ stage, count: 1 }));

    renderWithRouter(<PipelineStatsWidget stats={stats as never} />);

    for (const stage of ALL_STAGES) {
      // "Gewonnen" erscheint zusätzlich als Summary-Label → mind. 1 Treffer reicht
      const matches = screen.getAllByText(PIPELINE_STAGE_LABELS[stage]);
      expect(matches.length).toBeGreaterThan(0);
    }
  });
});

describe('Cross-Component-Konsistenz', () => {
  it('PipelineColumn und PipelineHeatmap zeigen identischen Text pro Stage', () => {
    for (const stage of ALL_STAGES) {
      // Column rendern und Label-Text einsammeln
      const { unmount } = renderWithRouter(
        <PipelineColumn stage={stage} items={[]} />
      );
      const columnLabel = screen.getAllByText(PIPELINE_STAGE_LABELS[stage])[0]
        ?.textContent;
      unmount();

      // Heatmap rendern und Label-Text einsammeln
      const empty = ALL_STAGES.reduce((acc, s) => {
        acc[s] = [];
        return acc;
      }, {} as Record<PipelineStage, []>);

      renderWithRouter(
        <PipelineHeatmap
          pipelineByStage={empty as never}
          stageOrder={[stage]}
          selectedStage={null}
          onStageSelect={() => {}}
        />
      );
      const heatmapLabel = screen.getAllByText(PIPELINE_STAGE_LABELS[stage])[0]
        ?.textContent;

      expect(columnLabel).toBe(heatmapLabel);
      expect(columnLabel).toBe(PIPELINE_STAGE_LABELS[stage]);
      cleanup();
    }
  });

  it('keine Komponente nutzt veraltete Legacy-Labels', () => {
    const LEGACY = [
      'Neuer Lead',
      'Call geplant',
      'Call durchgeführt',
      'Analyse bereit',
      'Angebot Entwurf',
      'Angebot gesendet',
      'Zahlung freigeschaltet',
    ];

    const stats = ALL_STAGES.map((stage) => ({ stage, count: 1 }));
    const empty = ALL_STAGES.reduce((acc, s) => {
      acc[s] = [];
      return acc;
    }, {} as Record<PipelineStage, []>);

    renderWithRouter(
      <>
        <PipelineStatsWidget stats={stats as never} />
        <PipelineHeatmap
          pipelineByStage={empty as never}
          stageOrder={ALL_STAGES}
          selectedStage={null}
          onStageSelect={() => {}}
        />
        {ALL_STAGES.map((s) => (
          <PipelineColumn key={s} stage={s} items={[]} />
        ))}
      </>
    );

    for (const legacy of LEGACY) {
      expect(screen.queryByText(legacy)).toBeNull();
    }
  });
});

/**
 * Mock-basierter Test: Wenn `PIPELINE_STAGE_LABELS` geändert wird, müssen alle
 * Komponenten den neuen Text zeigen. Dieser Test isoliert das Modul und
 * verifiziert, dass keine Komponente Labels gecached oder hartkodiert hat.
 */
describe('Label-Änderungen propagieren in alle Komponenten', () => {
  it('ändert sich das zentrale Label, ändert sich auch das gerenderte Label', async () => {
    vi.resetModules();

    vi.doMock('@/types/crm', async () => {
      const actual = await vi.importActual<typeof import('@/types/crm')>(
        '@/types/crm'
      );
      return {
        ...actual,
        PIPELINE_STAGE_LABELS: {
          ...actual.PIPELINE_STAGE_LABELS,
          new_lead: 'TEST_LABEL_NEW_LEAD',
        },
      };
    });

    const { PipelineColumn: ColMock } = await import('../PipelineColumn');
    const { PipelineHeatmap: HeatMock } = await import('../PipelineHeatmap');
    const { PipelineStatsWidget: WidgetMock } = await import(
      '@/components/dashboard/PipelineStatsWidget'
    );

    cleanup();
    renderWithRouter(
      <>
        <ColMock stage="new_lead" items={[]} />
        <HeatMock
          pipelineByStage={{ new_lead: [] } as never}
          stageOrder={['new_lead']}
          selectedStage={null}
          onStageSelect={() => {}}
        />
        <WidgetMock stats={[{ stage: 'new_lead', count: 3 }] as never} />
      </>
    );

    const matches = screen.getAllByText('🧪 TEST_LABEL_NEW_LEAD');
    // Erwartet: 1× Column (Title), 1× Heatmap, 1× Widget = 3 Treffer minimum
    expect(matches.length).toBeGreaterThanOrEqual(3);

    vi.doUnmock('@/types/crm');
    vi.resetModules();
  });
});
