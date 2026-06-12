import { mkdir, stat, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import sharp from "sharp";

const AIDA = "https://lh3.googleusercontent.com/aida-public/";

const assets = [
  {
    source: `${AIDA}AB6AXuAzDaJP5NTIHHTYVuPLe0HSNNvPWxfvgP9vPRBtCsLLCj91ZX4AYXg1jMe0NNEHY45XK9WhWLzn24KVI7_wNqUzsGW43vnJpJxyUKmt8ib-xgec_bTuLLVqTesp6ORnffoslmPgDUP8uPXTI-R2mXBiIIK__72_pV4bXdSXT2Lo1jsAl11hnudAeZsQjcsIaq9FOCSN3lU5tjrCQZvzNkTpoNR85SSyiBwXdp0K6YEQhBpeRJvrqgZFac7H8CuqC9nJaEfNwQ2GX2c`,
    target: "public/assets/softkeystore/hero/hero-marketplace.jpg",
  },
  {
    source: `${AIDA}AB6AXuDl7AcpVRouUcO87j0l-9ThNlGuOlHZwTEm0_gfrYraavxykdkHM27-Wes3pe0I-pyMX1ceS7UGbZCCBtD5JFUZX_YdABcmLG8Gu5rRp2Thh0dZ1KyryHsAdrp5vCk7y0kBBxVuMmns1dUXq108Wm6PESvnfJMDaTVzmkrPwOvjOn8RjsZxIGnRM21qm5u5PEIdS4vcZfSQrCCySll7xlKN0LgzYdg_6wDnSNV8Zb15gVE0o524sBQRMf7IhAsu2nBJEuzfPuQ9RWw`,
    target: "public/assets/softkeystore/hero/hero-creative.jpg",
  },
  {
    source: `${AIDA}AB6AXuA1RH2hVxXcueGYcyk4uDu2nSfas7ugR1NKQKoaQtK7OS3Zdl7wisAsO4PDsEEvUk1XxZItRKo6XGuYal1RtBt_wgIqjNZIMGrT04Chl0lBWMy8bGw76BNpobGLE4WDxzqjo16eIzaIPB-0F4zAY-Ampazo5N7Bv2nIHxLL_s3pAd85__rymnF1zY-17Q1gpV_Z7yoDKxU8Hn3k7Sa0EeHxym0kUJ30OxmHcMIQxyzyO6-k-yI1z33_tm6bF5y_8bj8IRxXOS7qBVw`,
    target: "public/assets/softkeystore/hero/hero-security.jpg",
  },
  {
    source: `${AIDA}AB6AXuDu0NPinBhqhracWPNMZugZxfzQ-7i1qFnNc8twGS2yZgmuXq24XyrDZwJMD6QmmsmANU7s2T4lvZthUM4dUab0bTmZPqtg9F-psRMiNAjNgLo-QhlLQnnET0u-tl6kQVJDiQ_0iKgU1ZPgprfECBfc_W62wZiYu4A0x7T_d613cTCsG0hYy7G0_NSMM_prhmBpKynIj2SDJhQjEix4Vb5ZoTW_05FsPwCgw_QZM7jfVUHNhJntlHgG0WZ4bYrcAUIMted8FTivedw`,
    target: "public/assets/softkeystore/products/windows11-pro.png",
  },
  {
    source: `${AIDA}AB6AXuDx2EcIkdeYfPmbfPJl81EftYdjGvx9H6w4mVCF9nQfgSAjT1zqpCnfGlCiZIhalCSv0y0cnVuVOg9ATLl4BuHX1UrnKBgAaOTtgvCFmAAVv8DPja4LP6hw1fXzKNZh0gsj6sBOf6k28YxophiTpwThdoZu58CuHLAjYJFgW5IvPis7y_KCab4g8gf7ZLycxuG1DDf3y0KYShg8BgOL9vNdkuQQeNKBG42mOtM54-FPt_KKKEl_A5wYBU05sqkKNJIjw7xNe99qZmo`,
    target: "public/assets/softkeystore/products/windows10-pro.png",
  },
  {
    source: `${AIDA}AB6AXuCZfHuhkb55RBCMPn3khDQuHh0wzhTPNUIqAGuxllC8CYspA1vAqVCIfHy0XYIIUnki0muBxt_Th8NJGPKElftl-nSxQifQFBOL3fC6ruvQO96QAX1td7ZtVhaQ0E_rUcmQFN7ns_ggqeA-dvSFD8XQquXJGYbfF_7CVkZ--Ug-Qo4I5goCO_diqr5Yq3aeW1Wy7xuywcxrWlGzY0GL6BcrOmx9mutCKjeHp9rZDzleMuQC52cgOUFL8wirO-_X-AIVuUgSKKQgzAI`,
    target: "public/assets/softkeystore/products/office2021-pro.png",
  },
  {
    source: `${AIDA}AB6AXuAzkM0DQFAtUBgOEFrSxYnCMDjNdk6CwFEQynT9OoOxcYCvk_qLinQzfR-0SxjFflOoK25Bue_dRriQVY7jlAw3rzVEdEG4TsUIGGSNsGWvdFoJH4fe_cOMdtjUHVWOQLqMt8VIhSXLePsOMT547MT4X0zhnin8KGo3GvcNR4-g20MgAOBLUvguw_ytfkiPmA0EUrB2nAd4JlEXZ3MK6byNoav8zhqsb5YIfCthhLOlqISFU6YC8XP2kmVu314YlQ5DSPWm382ZgEY`,
    target: "public/assets/softkeystore/products/adobe-creative-cloud.png",
  },
  {
    source: `${AIDA}AB6AXuAzkM0DQFAtUBgOEFrSxYnCMDjNdk6CwFEQynT9OoOxcYCvk_qLinQzfR-0SxjFflOoK25Bue_dRriQVY7jlAw3rzVEdEG4TsUIGGSNsGWvdFoJH4fe_cOMdtjUHVWOQLqMt8VIhSXLePsOMT547MT4X0zhnin8KGo3GvcNR4-g20MgAOBLUvguw_ytfkiPmA0EUrB2nAd4JlEXZ3MK6byNoav8zhqsb5YIfCthhLOlqISFU6YC8XP2kmVu314YlQ5DSPWm382ZgEY`,
    target: "public/assets/softkeystore/products/adobe-photoshop.png",
  },
  {
    source: `${AIDA}AB6AXuAzkM0DQFAtUBgOEFrSxYnCMDjNdk6CwFEQynT9OoOxcYCvk_qLinQzfR-0SxjFflOoK25Bue_dRriQVY7jlAw3rzVEdEG4TsUIGGSNsGWvdFoJH4fe_cOMdtjUHVWOQLqMt8VIhSXLePsOMT547MT4X0zhnin8KGo3GvcNR4-g20MgAOBLUvguw_ytfkiPmA0EUrB2nAd4JlEXZ3MK6byNoav8zhqsb5YIfCthhLOlqISFU6YC8XP2kmVu314YlQ5DSPWm382ZgEY`,
    target: "public/assets/softkeystore/products/adobe-premiere.png",
  },
  {
    source: `${AIDA}AB6AXuD_HjpGM7H2ru4fG9bb7aXWvXDdPNRgrdVZfXVu5WGdYKwPxRFB5PNS69tKnc8_WLkOjEE5qn_NhEYHnEGMD5WMQdUa7DS3GhZetMDmGORcyPhLXlYwo1ZgLU526HuY1nrmAmmki5V9KiEp1V1WohZcYDLaQSs03bXD85Y4JjOcPNXBelF-GZvJoAPVSRCSXSFUOsb3gjADQT1Q6Gbc2LOVdMz3p-ItnCnL4QF6OKOCgwPEs2mL6BhSuoti2U737-kht_xuypjmk1c`,
    target: "public/assets/softkeystore/products/kaspersky-total.png",
  },
  {
    source: `${AIDA}AB6AXuD_HjpGM7H2ru4fG9bb7aXWvXDdPNRgrdVZfXVu5WGdYKwPxRFB5PNS69tKnc8_WLkOjEE5qn_NhEYHnEGMD5WMQdUa7DS3GhZetMDmGORcyPhLXlYwo1ZgLU526HuY1nrmAmmki5V9KiEp1V1WohZcYDLaQSs03bXD85Y4JjOcPNXBelF-GZvJoAPVSRCSXSFUOsb3gjADQT1Q6Gbc2LOVdMz3p-ItnCnL4QF6OKOCgwPEs2mL6BhSuoti2U737-kht_xuypjmk1c`,
    target: "public/assets/softkeystore/products/eset-smart.png",
  },
  {
    source: `${AIDA}AB6AXuD_HjpGM7H2ru4fG9bb7aXWvXDdPNRgrdVZfXVu5WGdYKwPxRFB5PNS69tKnc8_WLkOjEE5qn_NhEYHnEGMD5WMQdUa7DS3GhZetMDmGORcyPhLXlYwo1ZgLU526HuY1nrmAmmki5V9KiEp1V1WohZcYDLaQSs03bXD85Y4JjOcPNXBelF-GZvJoAPVSRCSXSFUOsb3gjADQT1Q6Gbc2LOVdMz3p-ItnCnL4QF6OKOCgwPEs2mL6BhSuoti2U737-kht_xuypjmk1c`,
    target: "public/assets/softkeystore/products/ccleaner-pro.png",
  },
  {
    source: `${AIDA}AB6AXuA1RH2hVxXcueGYcyk4uDu2nSfas7ugR1NKQKoaQtK7OS3Zdl7wisAsO4PDsEEvUk1XxZItRKo6XGuYal1RtBt_wgIqjNZIMGrT04Chl0lBWMy8bGw76BNpobGLE4WDxzqjo16eIzaIPB-0F4zAY-Ampazo5N7Bv2nIHxLL_s3pAd85__rymnF1zY-17Q1gpV_Z7yoDKxU8Hn3k7Sa0EeHxym0kUJ30OxmHcMIQxyzyO6-k-yI1z33_tm6bF5y_8bj8IRxXOS7qBVw`,
    target: "public/assets/softkeystore/products/nordvpn.png",
  },
  {
    source: `${AIDA}AB6AXuBI8Eodboh1r667u4AeC_mkYrBNBRBeS_HYF3xsCFqVCUwabgf9JA_e7ge3CvMlucUmpnuQKESm9EZDfOMqyhyHd2CF2FAaneMTKOfthxt-_FrIyvtHR6HxN-mLPzrPiG5YCUcl5kIM4KFBaKWSe8r27YHvx3sPSaxogA_7gnsvuFEj8GTIGc-Q1bFeBHBeovC8VUTQTz6j0Y3OMDFZBUFGICSvx4KXCuhpj4KGWji4YmPW7kX_1-pQW2gzu2BzKW85zmUZo5Bm1uw`,
    target: "public/assets/softkeystore/support/contact-location.jpg",
  },
  {
    source: `${AIDA}AB6AXuB57TClg2fRDDbNdbwdf7jJukKtC6tyIE39OyfMbyRflpDjckBlvpRTlmD6rVOI0gK9zFS7bmUeBU2iMStTMIaHKn2vTdXm5Wcg2zZb03WrEbwf2FKtP3pvmGvxTDtfZKvnpcVQyalmoL29fWJA24b2RBKjtnfHYp_6GexDXyNKOrika5idHFhEBMWPlu1mDxEXzsA2UWMtpO7WiqgpoGRfsfF8LE20tXMsJiw06dsx7PEyODd6M4dkf8aW_eUMAyKo3zyGjoIZq7s`,
    target: "public/assets/softkeystore/support/how-to-buy.jpg",
  },
  {
    source: `${AIDA}AB6AXuDS-LDcrofKrqa8o-WhKXqvd8dYDwql7-f9fRHBFxhkEbNTfGsITkMtPVVUR3BdHBXInc80_aqztyBMdURp-HAKgWRAgJFktya7dbbbsURHxxO35S4c8h-2QAOJ5pbC5PR7QJQjjnSFgt982D-fmLu3lFRmnBAkeks2t3VKF6XAd4ir6qWJD8fFpVykforX8XA5AdE7TBGweIwHgKPeminBfLU5Wu_1OhOtvp2TXQTtTgvqT-kVkl2e9yASRxLGWRKEw_fANA-Vuf4`,
    target: "public/assets/softkeystore/payments/promptpay-qr.png",
  },
  {
    source: `${AIDA}AB6AXuBigu8S8aCkSQAjcPoXKBI1-rqzLpjJ_CXBLqWHduQNcJAsNeKj8xkclfZW84IU9CGHNdpezsA-pTjHam3hoJy3bEpBo_DbDOiPyLbJKAZId3ZXKkXWXWYKHyBW50GvtPhdyhWC3Gv9yitZh7lOgY9Iqtofjsn8nIz6ZyXamf50VXqKTF8Xib_CL8u7lx6dnsD3Rj3KXu4iuIU3HY4smDShCcDaKNWygpZ5j1F3uX6EPe-hbWWM-mQ8A19S3MGLg3-pDpHH-E3BuDs`,
    target: "public/assets/softkeystore/payments/promptpay.png",
  },
  {
    source: `${AIDA}AB6AXuBHLAuhXVsc3fsABb7H-_tCkKYsRlM2sGWe4c8GAmYCQsyLFg7PKmIgh4VNmwQRBmuQznzhuWFf68wiYBWqgovrqTA3heMUBiP1ZfrEPPFQS02tChYimz0nn3VGzYoTyVRgJ1PMDiAWYUPnFvFYy_9AjDqWfg8TSBaEiXq7c6vRfIe93n-b3tUMhyg7L5wcevUKkmFPztklWSCNq3o0saBOF9HSpGGi6epjmGrOnXpJh9z5FKgNsNk4FZgRgMab-WS-RnAqKgyMnpA`,
    target: "public/assets/softkeystore/payments/visa.png",
  },
  {
    source: `${AIDA}AB6AXuAYfbxePNPsm0hru0icwnt9EXAKYWlb4T7luho17xciMmNY_0ShBW5rPvVvoAwG6H8CKcMeOf86pUeXjABF-jfpRxYe5rZDs7Vkuf1BmEUGydAnHYDhYJNCjnZ0Inov4F4N6gcy5YYXeaxr7tDcPFFA2onR7yZpOmh0_lW6ykdRGaOLoAydahdzXf-8HAM00RcgGu42DZk9hCIg3Hc4bgzcRLgbS_Q8cM4mc5cRtuq4A8sVW7ap9q_piRrxhqKM81rxazFjQauhNhk`,
    target: "public/assets/softkeystore/payments/mastercard.png",
  },
  {
    source: `${AIDA}AB6AXuADRXnjycmZDXl_pcBOJIGJB6y0pMiPRQpUXMlMrFBWgbhtQHy4MiN5BM-0AAhloFTpDHRTukDn-tWoCDwlJ5gyqAPuUNxJfHjNXIn-J39NSz0M19_0YarjbiuMHzh2Xd35Hd04GQpG_acld-Wvb_oMn1iuOgWxlXZh7Qz7-d-uwIzAWpPyHBOcHGMU_3v573ZnaiI3ZoRXkaTIbkRYJzMvce8aOVCrQAXuZ36txrS-GCeylwNae-JnuyZnACF8c0gsrZZ0NAU713M`,
    target: "public/assets/softkeystore/auth/google.png",
  },
  {
    source: `${AIDA}AB6AXuCcX6X5kbq8vCyOzT-IsQLBvCxwATNqa9pooNxbQt0LVhLqF2BFjuBTwUI9dknYhi-fsPlgPAFapml2W_1fRgEm-MI2JQ_dBGdEuezt06BPR5bUrydCtGkTZ5k72kkE9i5gWH9tx_G6RuGk1OXFPgPWboW6QI588z1NK_4TfeGgHL1xWnbMvfiBmR8bkDgEwwGQ2W6R7ELyy87koPyGsn0atGcF3c_7T7m5if7sIYNKitW44iDGzO7hgMcTxJ20BJ85IfsNN5N5eGE`,
    target: "public/assets/softkeystore/account/avatar.jpg",
  },
];

const force = process.argv.includes("--force");

async function outputExists(path) {
  try {
    const file = await stat(path);
    return file.size > 0;
  } catch {
    return false;
  }
}

async function convertImage(buffer, target) {
  const extension = extname(target).toLowerCase();
  const image = sharp(buffer).rotate();

  if (extension === ".jpg" || extension === ".jpeg") {
    return image.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  }

  return image.png({ compressionLevel: 9 }).toBuffer();
}

for (const asset of assets) {
  const target = resolve(asset.target);

  if (!force && (await outputExists(target))) {
    const existing = await stat(target);
    console.log(`skip ${asset.target} (${existing.size} bytes)`);
    continue;
  }

  const response = await fetch(asset.source, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Failed ${response.status} ${asset.source}`);
  }

  const sourceBuffer = Buffer.from(await response.arrayBuffer());
  if (sourceBuffer.length === 0) {
    throw new Error(`Empty response ${asset.source}`);
  }

  const outputBuffer = await convertImage(sourceBuffer, target);
  await mkdir(resolve(asset.target, ".."), { recursive: true });
  await writeFile(target, outputBuffer);
  console.log(`saved ${asset.target} (${outputBuffer.length} bytes)`);
}
