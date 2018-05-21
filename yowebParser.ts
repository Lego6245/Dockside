import * as request from 'request-promise-native';
import * as cheerio from 'cheerio';


const PUZZLES_IN_ORDER = ['Sailing', 'Rigging', 'Carpentry', 'Patching', "Bilging", "Gunning", "Treasure Haul", "Duty Navigation", "Battle Navigation", "Swordfighting", "Rumble"];

export class PuzzleRank {
    experience: string;
    standing: string;
}

export class PirateInfo {
    piracyPuzzleStanding: { [puzzleName: string]: PuzzleRank}
}

export class YoWebParser {
    constructor (private oceanName: string) {

    }

    private pirateInfoStore:{ [pirateName: string]: PirateInfo } = {};

    public getPirateSkillInfo(pirateName: string): Promise<PirateInfo> {

        if (this.pirateInfoStore[pirateName]) {
            console.log('from cache');
            return Promise.resolve(this.pirateInfoStore[pirateName]);
        }

        const options = {
            uri: 'http://' + this.oceanName + '.puzzlepirates.com/yoweb/pirate.wm?target=' + pirateName,
            transform: function (body) {
                return cheerio.load(body);
            }
        }

        return request(options)
            .then( ($) => {
                let pirateInfo = new PirateInfo();
                pirateInfo.piracyPuzzleStanding = {};
                let tablesOfInterest = $('table').get(9);
                $('tr', tablesOfInterest).each(function(i, elem) {
                    const skillInfo = $(this).text().replace(/\(.*\)/, '').trim().split('/');
                    pirateInfo.piracyPuzzleStanding[PUZZLES_IN_ORDER[i]] = {
                        experience: skillInfo[0],
                        standing: skillInfo[1]
                    }
                });
                this.pirateInfoStore[pirateName] = pirateInfo;
                return pirateInfo;
            });
    }
}