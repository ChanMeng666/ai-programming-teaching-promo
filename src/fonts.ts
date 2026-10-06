// Inter only, narrowed to the three weights and one subset the site loads —
// an unnarrowed import fetches over a hundred files per render worker.
import { loadFont } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

loadFont('normal', { weights: ['400', '500', '700'], subsets: ['latin'] });
loadMono('normal', { weights: ['400'], subsets: ['latin'] });
