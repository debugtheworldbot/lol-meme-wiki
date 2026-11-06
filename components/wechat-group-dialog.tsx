"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { LocalizedContent } from "@/components/localized-content";

const QR_CODE = "/wechat-group-2026-11-06.png";

export function WechatGroupDialog() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return <LocalizedContent>{(
    <>
      <button type="button" className="footer-community-button" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={() => setOpen(true)}>
        加入梗友群
      </button>
      <dialog ref={dialogRef} id={id} className="wechat-group-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onClose={() => setOpen(false)} onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false);
      }}>
        <div className="search-modal-head">
          <h2 id={`${id}-title`}>研发.lol 梗友群</h2>
          <button type="button" aria-label="关闭" onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="wechat-group-content">
          <p id={`${id}-description`}>聊比赛、分享新梗，一起补全出处。</p>
          {open ? <Image className="wechat-group-image" src={QR_CODE} alt="研发.lol 梗友群微信入群二维码，11 月 13 日前有效" width={720} height={1132} unoptimized /> : null}
          <p>用微信扫码加入，或保存图片后在微信中识别。</p>
          <a className="wechat-group-save" href={QR_CODE} download="研发.lol-梗友群.png">保存二维码</a>
          <p className="wechat-group-expiry">二维码 11 月 13 日前有效，手机上也可长按图片保存。</p>
        </div>
      </dialog>
    </>
  )}</LocalizedContent>;
}
