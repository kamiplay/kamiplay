import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import Sticky from "react-sticky-el";
import { useWindowSize } from "react-use";

import { SearchBarInput } from "@/components/form/SearchBar";
import { ThinContainer } from "@/components/layout/ThinContainer";
import { useSlashFocus } from "@/components/player/hooks/useSlashFocus";
import { HeroTitle } from "@/components/text/HeroTitle";
import { useIsTV } from "@/hooks/useIsTv";
import { useRandomTranslation } from "@/hooks/useRandomTranslation";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import { useBannerSize } from "@/stores/banner";

export interface HeroPartProps {
  setIsSticky: (val: boolean) => void;
  searchParams: ReturnType<typeof useSearchQuery>;
  showTitle?: boolean;
  isInFeatured?: boolean;
}

function getTimeOfDay(
  date: Date,
): "night" | "morning" | "day" | "420" | "69" | "halloween" {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 4 && day === 20) return "420";
  if (month === 6 && day === 9) return "69";
  if (month === 10 && day === 31) return "halloween";
  const hour = date.getHours();
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 19) return "day";
  return "night";
}

export function HeroPart({
  setIsSticky,
  searchParams,
  showTitle,
  isInFeatured,
}: HeroPartProps) {
  const { t: randomT } = useRandomTranslation();
  const [search, setSearch, setSearchUnFocus] = searchParams;
  const [showBg, setShowBg] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const bannerSize = useBannerSize();

  const stickStateChanged = useCallback(
    (isFixed: boolean) => {
      setShowBg(isFixed);
      setIsSticky(isFixed);
    },
    [setShowBg, setIsSticky],
  );

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const { isTV } = useIsTV();

  // Detect if running as a PWA on iOS
  const isIOSPWA =
    /iPad|iPhone|iPod/i.test(navigator.userAgent) &&
    window.matchMedia("(display-mode: standalone)").matches;

  const topSpacing = isIOSPWA ? 60 : 16;
  const [stickyOffset, setStickyOffset] = useState(topSpacing);

  const isLandscape = windowHeight < windowWidth && isIOSPWA;
  const adjustedOffset = isLandscape
    ? -40 // landscape
    : 0; // portrait

  useEffect(() => {
    if (windowWidth > 1280) {
      // On large screens the bar goes inline with the nav elements
      setStickyOffset(topSpacing);
    } else {
      // On smaller screens the bar goes below the nav elements
      setStickyOffset(topSpacing + 60 + adjustedOffset);
    }
  }, [adjustedOffset, topSpacing, windowWidth]);

  const time = getTimeOfDay(new Date());
  const title = randomT(`home.titles.${time}`);
  const placeholder = randomT(`home.search.placeholder`);
  const inputRef = useRef<HTMLInputElement>(null);
  useSlashFocus(inputRef);

  // Curated anime/life quotes (EN) to show on the welcome page
  useEffect(() => {
    const quotes: string[] = [
      // One Piece
      "If you don’t take risks, you can’t create a future. — Monkey D. Luffy (One Piece)",
      "No matter how deep the night, it always turns to day, eventually. — Brook (One Piece)",

      // Fullmetal Alchemist
      "A lesson without pain is meaningless. — Edward Elric (Fullmetal Alchemist)",
      "The world isn’t perfect... that’s what makes it so damn beautiful. — Roy Mustang (Fullmetal Alchemist)",

      // Naruto
      "If you don’t like your destiny, don’t accept it. Have the courage to change it. — Naruto Uzumaki (Naruto)",
      "People’s lives don’t end when they die, it ends when they lose faith. — Itachi Uchiha (Naruto)",

      // Attack on Titan
      "If you begin to regret, you’ll dull your future decisions. — Erwin Smith (Attack on Titan)",
      "People, who can’t throw something important away, can never hope to change anything. — Armin Arlert (Attack on Titan)",

      // Gurren Lagann
      "Believe in the you who believes in yourself. — Kamina (Gurren Lagann)",

      // Cowboy Bebop
      "I’m not going there to die. I’m going there to find out if I’m really alive. — Spike Spiegel (Cowboy Bebop)",

      // Rurouni Kenshin
      "Whatever you lose, you’ll find it again. But what you throw away you’ll never get back. — Kenshin Himura (Rurouni Kenshin)",

      // Fate/Zero
      "Whatever you do, enjoy it to the fullest. That is the secret of life. — Rider/Iskandar (Fate/Zero)",

      // Code Geass
      "If the king doesn’t move, then his subjects won’t follow. — Lelouch Lamperouge (Code Geass)",

      // Gintama
      "The past is the past, and the future is the future. — Gintoki Sakata (Gintama)",

      // Studio Ghibli (Movie)
      "We each need to find our own inspiration. — Ursula (Kiki’s Delivery Service)",
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <ThinContainer>
      <div
        className={classNames(
          "space-y-16 text-center",
          showTitle ? "mt-44" : `mt-4`,
        )}
      >
        {showTitle && (!isTV || search.length === 0) ? (
          <div className="relative z-10 mb-16">
            <HeroTitle className="mx-auto max-w-md bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
              {title}
            </HeroTitle>
            {quote ? (
              <p className="mt-4 text-sm text-type-dimmed italic max-w-xl mx-auto">
                {quote}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="relative h-20 z-30">
          <Sticky
            topOffset={stickyOffset * -1 + bannerSize}
            stickyStyle={{
              paddingTop: `${stickyOffset + bannerSize}px`,
            }}
            onFixedToggle={stickStateChanged}
          >
            <SearchBarInput
              ref={inputRef}
              onChange={setSearch}
              value={search}
              onUnFocus={setSearchUnFocus}
              placeholder={placeholder ?? ""}
              isSticky={showBg}
              isInFeatured={isInFeatured}
            />
          </Sticky>
        </div>
      </div>
    </ThinContainer>
  );
}
