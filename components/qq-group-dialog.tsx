"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { LocalizedContent } from "@/components/localized-content";

const QR_CODE = "/qq-group-1125802287.jpg";
const GROUP_NUMBER = "1125802287";

export function QqGroupDialog() {
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
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

  async function copyGroupNumber() {
    try {
      await navigator.clipboard.writeText(GROUP_NUMBER);
      setCopyStatus("群号已复制，打开 QQ 搜索群号即可申请加入。");
    } catch {
      numberRef.current?.focus();
      numberRef.current?.select();
      setCopyStatus("未能自动复制，请复制上方已选中的群号。");
    }
  }

  return <LocalizedContent>{(
    <>
      <button type="button" className="footer-community-button" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={() => { setCopyStatus(""); setOpen(true); }}>
        加入 QQ 群
      </button>
      <dialog ref={dialogRef} id={id} className="qq-group-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={(event) => { event.preventDefault(); setOpen(false); }} onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false);
      }}>
        <div className="search-modal-head">
          <h2 id={`${id}-title`}>研发.lol QQ 梗友群</h2>
          <button type="button" aria-label="关闭" onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="qq-group-content">
          <p id={`${id}-description`}>聊比赛、分享新梗，一起补全出处。</p>
          <div className="qq-group-number">
            <label htmlFor={`${id}-number`}>群号</label>
            <input ref={numberRef} id={`${id}-number`} value={GROUP_NUMBER} readOnly translate="no" />
            <button type="button" onClick={copyGroupNumber}>复制群号</button>
          </div>
          <p className="qq-group-copy-status" role="status">{copyStatus}</p>
          {open ? <Image className="qq-group-image" src={QR_CODE} alt="研发.lol 梗友群 QQ 入群二维码，群号 1125802287" width={1284} height={2283} unoptimized /> : null}
          <p>用 QQ 扫码，或搜索上方群号申请加入。</p>
          <a className="qq-group-save" href={QR_CODE} download="研发.lol-QQ梗友群.jpg">保存二维码</a>
          <p>手机上也可长按图片保存，再用 QQ 识别。</p>
        </div>
      </dialog>
    </>
  )}</LocalizedContent>;
}
