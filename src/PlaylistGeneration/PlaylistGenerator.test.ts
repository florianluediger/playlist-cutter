import {generatePlaylist} from "./PlaylistGenerator";
import {addTracksToPlaylist, createPlaylist, fetchTracks} from "./SpotifyClient";
import { vi } from 'vitest';

vi.mock("./SpotifyClient", () => {
    return {
        createPlaylist: vi.fn(),
        fetchTracks: vi.fn(),
        addTracksToPlaylist: vi.fn()
    }
});

it("generates playlist when input is correct", async () => {
    const includePlaylists = ["include"];
    const excludePlaylists = ["exclude"];
    const name = "name"
    const accessToken = "accessToken"
    const setGenerationStatus = vi.fn();

    const includeTracks = ["track1", "track2", "track3"];
    const excludeTracks = ["track3", "track4"];
    const resultingTracks = ["track1", "track2"];
    const playlistId = "playlistId";
    fetchTracks.mockResolvedValueOnce(includeTracks);
    fetchTracks.mockResolvedValueOnce(excludeTracks);
    createPlaylist.mockResolvedValueOnce(playlistId)

    await generatePlaylist(includePlaylists, excludePlaylists, name, accessToken, setGenerationStatus);

    expect(setGenerationStatus).toHaveBeenCalledTimes(4);
    expect(createPlaylist).toHaveBeenCalledWith(name, accessToken);
    expect(addTracksToPlaylist).toHaveBeenCalledWith(resultingTracks, playlistId, accessToken);
});