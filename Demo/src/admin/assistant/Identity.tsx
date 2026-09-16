/**
 * Identity — companion identity, under Assistant (companion/01-pages.md
 * §"The five admin destinations"; companion/03-rules.md companion.F27;
 * companion/05 §"What changes after publish").
 *
 * An administrator selects approved artwork and an accent, under the
 * presentation and contrast rules that already govern both. The accent tints
 * the character only, and one that would fail the shared contrast
 * requirement against any of the five tone colours is refused, naming the
 * failure. Artwork that cannot be read leaves the previous approved artwork
 * in place. The change applies everywhere, without a release.
 *
 * The default name is WizBit — frozen: there is no control for it at all,
 * an absence rather than a disabled field. The internal identity
 * `assistant` is frozen; historical audit records keep whatever applied.
 * The presentation and volume preferences and the learner's chosen name are
 * the profile domain's records — read here, never set here.
 *
 * Separately permissioned under its own named action. Fixture state only —
 * no store writes, no network.
 */

import { useState } from "react";
import { Card, CardHeader } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Notice } from "../../extraction/components/Notice/Notice";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { KeyValueRow, KeyValueTable } from "../../extraction/components/KeyValueRow/KeyValueRow";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview
} from "../assessments/shared";
import { ACCENT_OPTIONS, APPROVED_ARTWORK } from "./fixtures";

export function AssistantIdentity() {
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS.slice(0, 3));
  const [applied, setApplied] = useState({ artwork: APPROVED_ARTWORK[0]!.id, accent: ACCENT_OPTIONS[0]!.key });
  const [artwork, setArtwork] = useState(applied.artwork);
  const [accent, setAccent] = useState(applied.accent);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const chosenArtwork = APPROVED_ARTWORK.find((a) => a.id === artwork);
  const chosenAccent = ACCENT_OPTIONS.find((a) => a.key === accent);
  const dirty = artwork !== applied.artwork || accent !== applied.accent;

  function pickArtwork(id: string) {
    const target = APPROVED_ARTWORK.find((a) => a.id === id);
    if (target?.unreadable) {
      setFlash({
        tone: "error",
        text: `Refused — ${target.label} cannot be read. The previous approved artwork stays in place; nothing was applied.`
      });
      return;
    }
    setArtwork(id);
    setFlash(null);
  }

  function pickAccent(key: string) {
    const target = ACCENT_OPTIONS.find((a) => a.key === key);
    if (target?.failsAgainstTone) {
      setFlash({
        tone: "error",
        text: `Refused — ${target.label} fails the shared contrast requirement against the ${target.failsAgainstTone} tone colour. The accent tints the character only; nothing was applied.`
      });
      return;
    }
    setAccent(key);
    setFlash(null);
  }

  return (
    <AdminPage
      kicker="Assistant"
      title="Companion identity"
      lead="The approved artwork and the accent, applied everywhere without a release. The default name is WizBit — there is no control for it at all."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action="companion.edit_identity" /> : null}
      {preview !== "loading" && preview !== "refused" ? (
        <>
          {flash ? <Notice tone={flash.tone} live="polite">{flash.text}</Notice> : null}

          <div className="grid-2">
            <Card>
              <CardHeader title="Approved artwork" icon="sparkles" eyebrow="companion_identity" />
              <p className="meta">
                Every expression owes an approved animated treatment, a still frame carrying the same
                meaning, differentiation that never rests on colour alone, and a safe fallback if the
                artwork fails to arrive. Replacing the character changes artwork and nothing else —
                no persona picker, no cosmetics, no sound.
              </p>
              <List>
                {APPROVED_ARTWORK.map((a) => (
                  <ListRow
                    key={a.id}
                    selected={artwork === a.id}
                    onClick={() => pickArtwork(a.id)}
                  >
                    <div>
                      <strong>{a.label}</strong>
                      <p className="meta">
                        covers {a.coversExpressions} of 9 expressions
                        {a.unreadable ? " · cannot be read" : ""}
                      </p>
                    </div>
                  </ListRow>
                ))}
              </List>
            </Card>

            <Card>
              <CardHeader title="Accent" icon="theme" eyebrow="tints the character only" />
              <p className="meta">
                An accent that would fail the shared contrast requirement against any of the five
                tone colours is refused, naming the failure.
              </p>
              <div className="row" role="group" aria-label="Accent">
                {ACCENT_OPTIONS.map((a) => (
                  <Chip key={a.key} selected={accent === a.key} onClick={() => pickAccent(a.key)}>
                    {a.label}
                  </Chip>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="What is frozen" icon="lock" eyebrow="no controls render" />
            <KeyValueTable label="Frozen identity facts">
              <KeyValueRow
                as="definition"
                term="Default name"
                value="WizBit — the shipped display default, the result of a learner's Reset, and the unreadable-name fallback are the same one word. No control for it renders here."
              />
              <KeyValueRow
                as="definition"
                term="Internal identity"
                value="assistant — never changes; historical audit records keep whatever applied at the time"
              />
              <KeyValueRow
                as="definition"
                term="Presentation, volume, chosen name"
                value="The learner's own records in Profile and Settings — this page reads them and sets none of them"
              />
            </KeyValueTable>
          </Card>

          <div className="row">
            <Button icon="check" disabled={!dirty} onClick={() => setConfirmOpen(true)}>
              Apply everywhere
            </Button>
          </div>

          <Dialog
            open={confirmOpen}
            title="Apply companion identity"
            icon="sparkles"
            onClose={() => setConfirmOpen(false)}
            actions={
              <>
                <Button
                  onClick={() => {
                    setApplied({ artwork, accent });
                    setConfirmOpen(false);
                    setFlash({
                      tone: "success",
                      text: `Applied everywhere without a release — artwork ${chosenArtwork?.label}, accent ${chosenAccent?.label}.`
                    });
                  }}
                >
                  Confirm — applies without a release
                </Button>
                <Button variant="quiet" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              </>
            }
          >
            <p>
              Artwork <strong>{chosenArtwork?.label}</strong>, accent{" "}
              <strong>{chosenAccent?.label}</strong>. The change reaches every corner the companion
              renders in at once — it is not versioned and re-notifies nobody.
            </p>
          </Dialog>
        </>
      ) : null}
    </AdminPage>
  );
}
