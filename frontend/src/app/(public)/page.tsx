import WorkConveyer from "@/components/works/list";
import { ImagesProvider } from "@/contexts/imagesContext";
import { TechsProvider } from "@/contexts/techsContext";
import { WorksProvider } from "@/contexts/worksContext";
import { delaGothicOne } from "@/lib/fonts";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <ImagesProvider>
        <WorksProvider>
          <TechsProvider>
            <section
              aria-label="top-view"
              className="relative h-dvh w-full bg-gray-50"
            >
              <div className="font-dot absolute flex size-full items-center justify-center text-8xl leading-none">
                isirmt
              </div>
            </section>
            <nav className="sticky top-0 z-50 -mt-20 h-20 w-full bg-white">
              <ul className="font-dot flex h-full w-full items-center justify-start gap-6 px-10 tracking-wide">
                <li>
                  <Link
                    href={`/`}
                    className="inline-flex flex-col items-center justify-center"
                  >
                    <div className="text-2xl leading-none">Profile</div>
                    <div className="text-sm leading-none">プロフィール</div>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/console`}
                    className="inline-flex flex-col items-center justify-center"
                  >
                    <div className="text-2xl leading-none">Console</div>
                    <div className="text-sm leading-none">コンソール</div>
                  </Link>
                </li>
              </ul>
            </nav>
            <section aria-label="profile" className="relative w-full">
              <div className="relative z-10 mt-32 w-4/5 rounded-tr-4xl bg-[#ffe7bb] [box-shadow:.5rem_.5rem_0_0_#f7885c]">
                <div className="font-dot absolute -top-10 left-24 flex flex-col items-center justify-center">
                  <div className="text-6xl leading-none tracking-wider">
                    入本聖也
                  </div>
                  <div className="text-3xl leading-none font-semibold tracking-wide">
                    seiya irimoto
                  </div>
                </div>
                <div className="ml-36 flex gap-10 py-24">
                  <div className="flex flex-col items-end gap-6">
                    <div className="size-48 overflow-hidden rounded-2xl">
                      <Image
                        src={"/isirmt_icon.webp"}
                        width={192}
                        height={192}
                        alt="isirmt_icon"
                      />
                    </div>
                    <button className="size-12 rounded-2xl bg-[#f7885c]"></button>
                  </div>
                  <div className="flex flex-col gap-6 text-lg font-semibold tracking-wide text-[#61230b]">
                    <div>2004年 3月 8日生</div>
                    <div>千葉大学工学部総合工学科医工学コース</div>
                    <div>
                      プログラミング等を活用したアプリケーションを制作
                      <br />
                      イラスト・音楽・映像等も組み合わせた作品の制作にも挑戦中
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative -mt-6 flex flex-col items-center justify-center bg-[#c6f4ff] py-20">
                <div className="flex w-fit flex-col gap-3">
                  <div
                    className={`text-2xl text-[#054a5c] ${delaGothicOne.className}`}
                  >
                    資格
                  </div>
                  <ul className="ml-8 flex flex-col gap-3 text-[#054a5c]"></ul>
                </div>
              </div>
            </section>
            <section aria-label="works-display" className="relative w-full">
              <WorkConveyer />
            </section>
          </TechsProvider>
        </WorksProvider>
      </ImagesProvider>
    </main>
  );
}
