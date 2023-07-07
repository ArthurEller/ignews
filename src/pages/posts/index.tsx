import Head from "next/head";
import styles from "./styles.module.scss";

export default function Posts() {
  return (
    <>
      <Head>
        <title>Posts | ig.news</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <a href="">
            <time>12 de março de 2023</time>
            <strong>Lorem ispum dollor</strong>
            <p>site ammet</p>
          </a>

          <a href="">
            <time>12 de março de 2023</time>
            <strong>Lorem ispum dollor</strong>
            <p>site ammet</p>
          </a>

          <a href="">
            <time>12 de março de 2023</time>
            <strong>Lorem ispum dollor</strong>
            <p>site ammet</p>
          </a>
        </div>
      </main>
    </>
  );
}
