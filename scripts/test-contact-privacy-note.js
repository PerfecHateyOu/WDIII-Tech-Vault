/**
 * The contact form tells visitors where their message goes (it is emailed through Resend, and this site
 * keeps no copy). Static check of index.html: the note exists inside #contactForm, names the email service,
 * and the submit button points to it with aria-describedby.
 */
import fs from 'fs';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

console.log('\n=== CONTACT FORM PRIVACY NOTE ===');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const form = (html.match(/<form id="contactForm"[\s\S]*?<\/form>/) || [''])[0];
const note = (form.match(/<p id="contactPrivacy"[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '';
check('contact form exists', form.length > 0);
check('privacy note is inside the form', note.length > 0);
check('note names the email service (Resend)', /Resend/.test(note));
check('note says the message is emailed to the site owner', /emailed to the site owner/.test(note));
check('note says the site keeps no copy', /does not keep a copy/.test(note));
check('submit button is described by the note', /<button type="submit"[^>]*aria-describedby="contactPrivacy"/.test(form));
check('the note id is unique', (html.match(/id="contactPrivacy"/g) || []).length === 1);

console.log(`\n   CONTACT FORM PRIVACY NOTE: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
