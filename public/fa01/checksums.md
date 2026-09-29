# FA-01 submission checksums

SHA-256 of each raw submission exactly as the model returned it. `npm test`
(scripts/test-fa01-submissions.js) fails if a published file stops matching,
so any edit, whitespace trim, line-ending conversion or corruption is caught.
Submissions are marked `binary` in .gitattributes so Git never alters them.

When adding a submission, add its line here in the same format.

```
dc7f022f99a920ce0e97a7e6dc6834fafe35b05051a13a9bcffbdb94e7e76953  fa01/round-1/gemini.html
962868cfb34ca64bed509303d3faff1fe02a3b47f80994c67eda1e980a74651e  fa01/round-1/grok.html
51f79bd36aa80014d48bdf7d380da0dc5a205c369e2667473abf180efd0d1cbc  fa01/round-2/chatgpt.html
1442e9e0f708e73e5acf33e8330bc50dcadfd70851c633f5ce7c6b6493d7da4a  fa01/round-2/claude.html
a46f5fe791562ad4cb185f628c5070a8d0fc784ca1f4d9550bd077fd143d1db2  fa01/round-2/deepseek.html
dbb8aa3a534d6195ba950897593b3992ba328927b3301edf9fa05d3cd0b9203e  fa01/round-2/gemini.html
24587f77fac77f500fbce47afe9bf31e26a65ca6c8c59ff710f90ab1e781f5c8  fa01/round-2/grok.html
```
